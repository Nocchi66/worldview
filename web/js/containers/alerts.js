/* eslint-disable no-restricted-syntax */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AlertUtil from '../components/util/alert';
import { openCustomContent } from '../modules/modal/actions';
import { outageNotificationsSeenAction } from '../modules/notifications/actions';
import { hasVectorLayers } from '../modules/layers/util';
import {
  DISABLE_VECTOR_ZOOM_ALERT, DISABLE_VECTOR_EXCEEDED_ALERT, MODAL_PROPERTIES,
} from '../modules/alerts/constants';
import safeLocalStorage from '../util/local-storage';
import { getActiveLayers, subdailyLayersActive } from '../modules/layers/selectors';

const HAS_LOCAL_STORAGE = safeLocalStorage.enabled;
const {
  DISMISSED_COMPARE_ALERT,
  DISMISSED_DISTRACTION_FREE_ALERT,
  DISMISSED_EVENT_VIS_ALERT,
} = safeLocalStorage.keys;

class DismissableAlerts extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasDismissedEvents: !!safeLocalStorage.getItem(DISMISSED_EVENT_VIS_ALERT),
      hasDismissedCompare: !!safeLocalStorage.getItem(DISMISSED_COMPARE_ALERT),
      hasDismissedDistractionFree: !!safeLocalStorage.getItem(DISMISSED_DISTRACTION_FREE_ALERT),
      distractionFreeModeInitLoad: false,
    };
  }

  componentDidMount() {
    const { isDistractionFreeModeActive } = this.props;
    if (isDistractionFreeModeActive) {
      this.toggleDistractionFreeModeInitLoad(true);
    }
  }

  componentDidUpdate(prevProps) {
    const { isDistractionFreeModeActive } = this.props;
    const { distractionFreeModeInitLoad } = this.state;
    const isDistractionFreeModeActiveChanged = prevProps.isDistractionFreeModeActive && !isDistractionFreeModeActive;
    if (distractionFreeModeInitLoad && isDistractionFreeModeActiveChanged) {
      this.toggleDistractionFreeModeInitLoad(false);
    }
  }

  toggleDistractionFreeModeInitLoad(isActive) {
    this.setState({ distractionFreeModeInitLoad: isActive });
  }

  /**
   * Update state and local storage when
   * alert is dismissed
   *
   * @param {String} storageKey
   * @param {String} stateKey
   */
  dismissAlert(storageKey, stateKey) {
    safeLocalStorage.setItem(storageKey, true);
    this.setState({ [stateKey]: true });
  }

  render() {
    const {
      dismissOutageNotification,
      dismissVectorZoomAlert,
      dismissVectorExceededAlert,
      hasSubdailyLayers,
      isCompareActive,
      isDistractionFreeModeActive,
      isEmbedModeActive,
      isEventsActive,
      isSmall,
      isMobile,
      isAnimationActive,
      isVectorZoomAlertPresent,
      isVectorExceededAlertPresent,
      layerNotices,
      layerNoticesUnseen,
      openAlertModal,
    } = this.props;
    const {
      hasDismissedEvents,
      hasDismissedCompare,
      hasDismissedDistractionFree,
      distractionFreeModeInitLoad,
    } = this.state;
    const { eventModalProps, compareModalProps, vectorModalProps } = MODAL_PROPERTIES;
    const hasFailCondition = !HAS_LOCAL_STORAGE
    || isEmbedModeActive
    || distractionFreeModeInitLoad;
    if (hasFailCondition) return null;

    const showEventsAlert = !isSmall && !hasDismissedEvents && isEventsActive;
    const showCompareAlert = !isSmall && !hasDismissedCompare && isCompareActive;
    const showAnimationAlert = isMobile && isAnimationActive && hasSubdailyLayers;
    const layerOutages = layerNotices ? layerNotices.filter((obj) => obj.notification_type === 'outage') : null;
    const nonOutageNotificationCount = layerOutages ? layerNotices.length - layerOutages.length : null;
    const hasSeenOutageAlerts = nonOutageNotificationCount >= layerNoticesUnseen;

    return isDistractionFreeModeActive
      ? !hasDismissedDistractionFree && (
      <AlertUtil
        id="distraction-free-mode-active-alert"
        isOpen
        noPortal
        onDismiss={() => this.dismissAlert(DISMISSED_DISTRACTION_FREE_ALERT, 'hasDismissedDistractionFree')}
        message="You are now in distraction free mode. Click the eye button to exit."
      />
      ) : (
        <>
          {showEventsAlert && (
          <AlertUtil
            id="event-alert"
            isOpen
            noPortal
            onClick={() => openAlertModal(eventModalProps)}
            onDismiss={() => this.dismissAlert(DISMISSED_EVENT_VIS_ALERT, 'hasDismissedEvents')}
            message="Events may not be visible at all times."
          />
          )}
          {showCompareAlert && (
          <AlertUtil
            isOpen
            noPortal
            onClick={() => openAlertModal(compareModalProps)}
            onDismiss={() => this.dismissAlert(DISMISSED_COMPARE_ALERT, 'hasDismissedCompare')}
            message="You are now in comparison mode."
          />
          )}
          {isVectorZoomAlertPresent && (
          <AlertUtil
            isOpen
            noPortal
            onClick={() => openAlertModal(vectorModalProps)}
            onDismiss={dismissVectorZoomAlert}
            message="Vector features may not be clickable at all zoom levels."
          />
          )}
          {isVectorExceededAlertPresent && (
          <AlertUtil
            isOpen
            noPortal
            onDismiss={dismissVectorExceededAlert}
            message="Too many results at selected point. Zoom in map to see more individual points."
          />
          )}
          {showAnimationAlert && (
            <AlertUtil
              isOpen
              noPortal
              icon="info-circle"
              message="Some animations may use a large amount of data (>100MB)"
              onDismiss={() => {}}
            />
          )}
          {layerOutages && !hasSeenOutageAlerts && layerOutages.map((outage, index) => (
            <AlertUtil
              id="outage-alert"
              isOpen
              noPortal
              icon="info-circle"
              message={outage.message}
              onDismiss={dismissOutageNotification}
            />
          ))}
        </>
      );
  }
}
const mapDispatchToProps = (dispatch) => ({
  openAlertModal: ({ id, props }) => {
    dispatch(openCustomContent(id, props));
  },
  dismissVectorZoomAlert: () => dispatch({ type: DISABLE_VECTOR_ZOOM_ALERT }),
  dismissVectorExceededAlert: () => dispatch({ type: DISABLE_VECTOR_EXCEEDED_ALERT }),
  dismissOutageNotification: () => {
    dispatch(outageNotificationsSeenAction());
  },
});

const mapStateToProps = (state) => {
  const {
    embed, events, sidebar, compare, alerts, ui, animation, screenSize, notifications,
  } = state;
  const { numberUnseen: layerNoticesUnseen } = notifications;
  const { layerNotices } = notifications.object;
  const { isVectorZoomAlertPresent, isVectorExceededAlertPresent } = alerts;
  const activeLayers = getActiveLayers(state);
  const hasActiveVectorLayers = hasVectorLayers(activeLayers);

  return {
    isCompareActive: compare.active,
    isDistractionFreeModeActive: ui.isDistractionFreeModeActive,
    isEmbedModeActive: embed.isEmbedModeActive,
    isEventsActive: !!(events.selected.id && sidebar.activeTab === 'events'),
    isSmall: screenSize.screenWidth < screenSize.breakpoints.small,
    isMobile: screenSize.isMobileDevice,
    isAnimationActive: animation.isActive,
    isVectorZoomAlertPresent: hasActiveVectorLayers && isVectorZoomAlertPresent,
    isVectorExceededAlertPresent: hasActiveVectorLayers && isVectorExceededAlertPresent,
    hasSubdailyLayers: subdailyLayersActive(state),
    layerNotices,
    layerNoticesUnseen,
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DismissableAlerts);

DismissableAlerts.propTypes = {
  dismissOutageNotification: PropTypes.func,
  dismissVectorZoomAlert: PropTypes.func,
  dismissVectorExceededAlert: PropTypes.func,
  hasSubdailyLayers: PropTypes.bool,
  isAnimationActive: PropTypes.bool,
  isCompareActive: PropTypes.bool,
  isDistractionFreeModeActive: PropTypes.bool,
  isEmbedModeActive: PropTypes.bool,
  isEventsActive: PropTypes.bool,
  isSmall: PropTypes.bool,
  isMobile: PropTypes.bool,
  isVectorZoomAlertPresent: PropTypes.bool,
  isVectorExceededAlertPresent: PropTypes.bool,
  layerNotices: PropTypes.array,
  layerNoticesUnseen: PropTypes.number,
  openAlertModal: PropTypes.func,
};
