//-----------------------------------------
//
// Main App
//
//-----------------------------------------

// @flow

import * as React from 'react';

import { Howl } from 'howler';
import classNames from 'classnames';
import { Route, withRouter } from 'react-router-dom';

import * as db from './utils/db';
import { checkWebGL } from './utils';
import Nav from './components/Nav/Nav';
import Marquee from './components/Marquee/Marquee';
import Boot from './components/Boot/Boot';
import Canvas from './scene/Canvas';
import Story from './components/Story/Story';
import Dashboard from './components/Dashboard/Dashboard';
import Stats from './components/Dashboard/Stats/Stats';

import data from './data';
import marqueeText from './data/marquee.txt';

import tick from './audio/click_digi_02.mp3';
import enter from './audio/click_ping.mp3';
import exit from './audio/click_plink.mp3';

import styles from './App.css';

import type { ItemData } from './types';

// SFX for main page
const tickAudio: any = new Howl({ src: [tick], volume: 0.1 });
const enterAudio: any = new Howl({ src: [enter], volume: 0.2 });
const exitAudio: any = new Howl({ src: [exit], volume: 0.2 });

type Props = {
  location: any
};

type State = {
  marqueeText: string,
  data: Array<ItemData>,
  activeStory: ?ItemData,
  bootFinished: boolean,
  backgroundLoaded: boolean,
  lastVisit: any
};

//-----------------------------------------
// Main
//
class App extends React.Component<Props, State> {
  state = {
    marqueeText: '',

    // person data
    data: [],
    activeStory: null,
    bootFinished: false,
    backgroundLoaded: false,
    lastVisit: ''
  };

  canvas: any;
  c: ?HTMLDivElement;

  async componentDidMount() {
    try {
      await db.saveVisit();
    } catch (err) {
      console.log('ERror setting visit', err);
    }

    this.fetchSiteData();
    this.fetchMarquees();
    this.setAudio();

    // if webgl present, run it
    if (checkWebGL()) {
      this.canvas = new Canvas(this.c, this.backgroundLoadedCallback);
    }
  }

  componentDidUpdate(oldProps) {
    const { pathname } = this.props.location;
    // if we are landing on root page from another page
    if (oldProps.location.pathname !== pathname && pathname === '/') {
      this.setState(
        {
          activeStory: null
        },
        () => {
          if (this.canvas) {
            this.canvas.rootTexture();
          }
          exitAudio.play();
        }
      );
    } else if (oldProps.location.pathname !== pathname && pathname !== '/') {
      enterAudio.play();
    }
  }

  // Get main site data
  async fetchSiteData() {
    try {
      const val = await db.getCompletedItems();
      const date = await db.getLastVisit();
      this.setState({
        data: data.map(c =>
          Object.assign({}, c, { hasCalled: val.includes(c.slug) })
        ),
        lastVisit: date
      });
    } catch (err) {
      this.setState({
        data: data,
        lastVisit: new Date()
      });
    }
  }

  // Get all marquee text
  async fetchMarquees() {
    const p1 = fetch(marqueeText);
    const res = await p1;
    const text = await res.text();
    this.setState({
      marqueeText: text
    });
  }

  //-----------------------------------------
  // Handle main audio setup
  //
  setAudio() {}

  //-----------------------------------------
  // Main BG images loaded
  //
  backgroundLoadedCallback = () => {
    this.setState({
      backgroundLoaded: true
    });
  };

  //-----------------------------------------
  // Boot is done
  //
  onFinishedBoot = () => {
    this.setState({
      bootFinished: true
    });
  };

  handleMouseEnter = item => {
    const self = this;
    return function() {
      if (self.canvas) {
        self.canvas.swapTexture(item.slug);
        tickAudio.play();
      }
    };
  };

  // show the phone texture
  rootTexture = () => {
    if (this.canvas) this.canvas.rootTexture();
  };

  // change shader background
  swapTexture = item => {
    if (this.canvas) this.canvas.swapTexture(item.slug);
  };

  // Glitch the shader
  setFlash = () => {
    if (this.canvas) this.canvas.flashTexture();
  };

  // Set current active story
  setGlobalActiveStory = story => {
    this.setState({ activeStory: story });
  };

  flagAsComplete = slug => {
    this.setState({
      data: this.state.data.map(d => {
        if (d.slug === slug) {
          return Object.assign({}, d, { hasCalled: true });
        }

        return d;
      })
    });
  };

  //-----------------------------------------
  // Render
  //
  render() {
    const {
      activeStory,
      bootFinished,
      data,
      lastVisit,
      marqueeText
    } = this.state;

    const cx = classNames({
      [styles.Background]: true,
      [styles.BackgroundLoaded]: this.state.backgroundLoaded
    });

    const cleanedData = data.filter(d => d.id !== 0);

    return (
      <div className={styles.App}>
        <Nav activeStory={activeStory} />
        {/*BACKGROUND CANVAS */}
        <div className={cx}>
          <div ref={c => (this.c = c)} />{' '}
        </div>
        <Stats lastVisit={lastVisit} activeStory={activeStory} />
        <Route
          exact
          path="/"
          render={() => {
            return (
              <React.Fragment>
                <Boot
                  onFinishedBoot={this.onFinishedBoot}
                  bootFinished={bootFinished}
                />

                <Dashboard
                  bootFinished={bootFinished}
                  data={cleanedData}
                  handleMouseEnter={this.handleMouseEnter}
                  lastVisit={lastVisit}
                  setFlash={this.setFlash}
                />
              </React.Fragment>
            );
          }}
        />
        <Route
          path="/stories/:person"
          render={props => {
            return (
              <Story
                {...props}
                swapTexture={this.swapTexture}
                setFlash={this.setFlash}
                setGlobalActiveStory={this.setGlobalActiveStory}
                flagAsComplete={this.flagAsComplete}
              />
            );
          }}
        />
        <div className={styles.Marquee}>
          <Marquee text={marqueeText} />
        </div>
      </div>
    );
  }
}

export default withRouter(App);
