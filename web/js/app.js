import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import whatInput from 'what-input';

// Utils
import util from './util/util';
import { STARTUP } from './util/constants';
// eslint-disable-next-line import/no-named-as-default
import MapInteractions from './containers/map-interactions/map-interactions';
// Toolbar
import Toolbar from './containers/toolbar';
import Sidebar from './containers/sidebar/sidebar';
// Modal
import Modal from './containers/modal';
import { openCustomContent } from './modules/modal/actions';
// Location Search
import LocationSearch from './components/location-search/location-search';

// Other/MISC
import Brand from './brand';
import Embed from './containers/embed';
import MeasureButton from './components/measure-tool/measure-button';
import FeatureAlert from './components/feature-alert/alert';
import Alerts from './containers/alerts';
import LoadingSpinner from './components/map/loading-spinner';
import './font-awesome-library';
import { addToLocalStorage } from './modules/notifications/util';
import { notificationsSeen, outageNotificationsSeenAction } from './modules/notifications/actions';

// actions
import Tour from './containers/tour';
import Timeline from './containers/timeline/timeline';
import AnimationWidget from './containers/animation-widget/animation-widget';
import ErrorBoundary from './containers/error-boundary';
import Debug from './components/util/debug';
import keyPress from './modules/key-press/actions';
import setScreenInfo from './modules/screen-size/actions';
// Notifications
import Notifications from './containers/notifications';
// Dependency CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'ol/ol.css';
import 'simplebar/dist/simplebar.min.css';
import 'react-image-crop/dist/ReactCrop.css';
import 'react-resizable/css/styles.css';
// App CSS
import '../scss/index.scss';

require('@elastic/react-search-ui-views/lib/styles/styles.css');

const { events } = util;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.onload();
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.setVhCSSProperty = this.setVhCSSProperty.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
    window.addEventListener('resize', this.setVhCSSProperty);
    window.addEventListener('orientationchange', this.setVhCSSProperty);
  }

  componentDidUpdate(prevProps) {
    // Check if the numberUnseen prop has changed
    const {
      kioskModeEnabled, notifications, numberOutagesUnseen,
    } = this.props;
    if (numberOutagesUnseen !== prevProps.numberOutagesUnseen) {
      if (numberOutagesUnseen > 0 && !kioskModeEnabled) {
        this.openNotification(notifications, numberOutagesUnseen);
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
    window.removeEventListener('resize', this.setVhCSSProperty);
    window.removeEventListener('orientationchange', this.setVhCSSProperty);
  }


  // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
  setVhCSSProperty = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  handleKeyPress(event) {
    const { keyPressAction } = this.props;
    const ctrlOrCmdKey = event.ctrlKey || event.metaKey;
    const isInput = event.srcElement.nodeName === 'INPUT';
    keyPressAction(event.keyCode, event.shiftKey, ctrlOrCmdKey, isInput);
  }

  getScreenInfo = () => {
    const { setScreenInfoAction } = this.props;
    setScreenInfoAction();
  };

  openNotification = (obj, numberOutagesUnseen) => {
    const { notificationClick } = this.props;
    notificationClick(obj, numberOutagesUnseen);
  };

  onload() {
    const self = this;
    const state = self.props.parameters;
    const { config } = self.props;
    config.parameters = state;

    const main = function() {
      // Load any additional scripts as needed
      if (config.scripts) {
        util.loadScripts(config.scripts);
      }

      if (Brand.release()) {
        // Console build version notifications
        console.info(
          `${Brand.NAME
          } - Version ${
            Brand.VERSION
          } - ${
            Brand.BUILD_TIMESTAMP}`,
        );
      } else {
        console.warn('Development version');
      }
      window.addEventListener('resize', () => {
        self.getScreenInfo();
      });
      window.addEventListener('orientationchange', () => {
        self.getScreenInfo();
      });
      self.getScreenInfo();
      events.trigger(STARTUP);
      self.setVhCSSProperty();
    };
    util.wrap(main)();
  }

  render() {
    const {
      isAnimationWidgetActive,
      isEmbedModeActive,
      isMobile,
      isTourActive,
      numberOutagesUnseen,
      locationKey,
      modalId,
      parameters,
    } = this.props;
    const appClass = `wv-content ${isEmbedModeActive ? 'embed-mode' : ''}`;
    return (
      <div className={appClass} id="wv-content" data-role="content">
        {!isMobile && !isEmbedModeActive && <LocationSearch />}
        <LoadingSpinner />
        <Toolbar />
        <MapInteractions />
        <div id="wv-alert-container" className="wv-alert-container">
          <FeatureAlert />
          <Alerts />
          {isTourActive && numberOutagesUnseen === 0 && (!isMobile || isEmbedModeActive) ? <Tour /> : null}
        </div>
        <Sidebar />
        <div id="layer-modal" className="layer-modal" />
        <div id="layer-settings-modal" />
        <div id="eventsHolder" />
        <div id="imagedownload" />
        <Timeline />
        <div>
          {isAnimationWidgetActive ? <AnimationWidget key={locationKey || '2'} /> : null}
        </div>
        <MeasureButton />
        <Embed />
        <Modal key={modalId} />
        <ErrorBoundary>
          <Debug parameters={parameters} />
        </ErrorBoundary>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { notifications } = state;
  const {
    numberOutagesUnseen, numberUnseen, type, object,
  } = notifications;
  const kioskModeEnabled = (state.ui.eic !== null && state.ui.eic !== '') || state.ui.isKioskModeActive;
  return {
    state,
    kioskModeEnabled,
    isAnimationWidgetActive: state.animation.isActive,
    isEmbedModeActive: state.embed.isEmbedModeActive,
    isMobile: state.screenSize.isMobileDevice,
    isTourActive: state.tour.active,
    notifications,
    numberOutagesUnseen,
    numberUnseen,
    object,
    tour: state.tour,
    type,
    config: state.config,
    parameters: state.parameters,
    locationKey: state.location.key,
    modalId: state.modal.id,
  };
}
const mapDispatchToProps = (dispatch) => ({
  keyPressAction: (keyCode, shiftKey, ctrlOrCmdKey, isInput) => {
    dispatch(keyPress(keyCode, shiftKey, ctrlOrCmdKey, isInput));
  },
  setScreenInfoAction: () => {
    dispatch(setScreenInfo());
  },
  notificationClick: (obj, numberOutagesUnseen) => {
    dispatch(
      openCustomContent('NOTIFICATION_LIST_MODAL', {
        headerText: 'Notifications',
        bodyComponent: Notifications,
        source: 'outage-alert',
        onClose: () => {
          if (numberOutagesUnseen > 0) {
            dispatch(outageNotificationsSeenAction());
            addToLocalStorage({ ...obj.object });
          }
        },
      }),
    );
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);

App.propTypes = {
  isAnimationWidgetActive: PropTypes.bool,
  kioskModeEnabled: PropTypes.bool,
  isEmbedModeActive: PropTypes.bool,
  isMobile: PropTypes.bool,
  isTourActive: PropTypes.bool,
  keyPressAction: PropTypes.func,
  locationKey: PropTypes.string,
  modalId: PropTypes.string,
  notificationClick: PropTypes.func,
  notifications: PropTypes.object,
  numberOutagesUnseen: PropTypes.number,
  parameters: PropTypes.object,
  setScreenInfoAction: PropTypes.func,
};
