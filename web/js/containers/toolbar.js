import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ButtonToolbar, Button } from 'reactstrap';
import { openCustomContent } from '../modules/modal/actions';
import ImageDownload from './image-download';
import Projection from './projection';
import InfoList from './info';
import ShareLinks from './share';
const CUSTOM_MODAL_PROPS = {
  TOOLBAR_PROJECTION: {
    headerText: null,
    type: 'toolbar',
    modalClassName: 'toolbar-list-modal toolbar-modal',
    backdrop: true,
    bodyComponent: Projection,
    offsetRight: '40px'
  },
  TOOLBAR_SHARE_LINK: {
    headerText: 'Copy Link to Share',
    type: 'toolbar',
    backdrop: false,
    offsetRight: '198px',
    modalClassName: 'toolbar-share-modal toolbar-modal toolbar-medium-modal',
    clickableBehindModal: true,
    wrapClassName: 'clickable-behind-modal',
    bodyComponent: ShareLinks
  },
  TOOLBAR_INFO: {
    headerText: null,
    backdrop: false,
    type: 'toolbar',
    modalClassName: 'toolbar-list-modal toolbar-modal',
    offsetRight: '10px',
    bodyComponent: InfoList
  },
  TOOLBAR_SNAPSHOT: {
    headerText: 'Take a Snapshot',
    backdrop: false,
    wrapClassName: 'clickable-behind-modal',
    type: 'selection',
    offsetRight: '70px',
    modalClassName: 'toolbar-snapshot-modal toolbar-modal toolbar-medium-modal',
    bodyComponent: ImageDownload
  }
};
class LinksContainer extends Component {
  render() {
    const {
      openModal,
      notificationType,
      notificationContentNumber
    } = this.props;
    const notificationClass = notificationType
      ? ' wv-status-' + notificationType
      : ' wv-status-hide';
    return (
      <ButtonToolbar id="wv-toolbar" className={'wv-toolbar'}>
        <Button
          id="wv-link-button"
          className="wv-toolbar-button"
          title="Share this map"
          onClick={() =>
            openModal(
              'TOOLBAR_SHARE_LINK',
              CUSTOM_MODAL_PROPS['TOOLBAR_SHARE_LINK']
            )
          }
        >
          <i className="fas fa-share-square fa-2x" />
        </Button>
        <Button
          id="wv-proj-button"
          className="wv-toolbar-button"
          title="Switch projection"
          onClick={() =>
            openModal(
              'TOOLBAR_PROJECTION',
              CUSTOM_MODAL_PROPS['TOOLBAR_PROJECTION']
            )
          }
        >
          <i className="fas fa-globe-asia fa-2x" />{' '}
        </Button>
        <Button
          id="wv-image-button"
          className="wv-toolbar-button"
          title="Take a snapshot"
          onClick={() =>
            openModal(
              'TOOLBAR_SNAPSHOT',
              CUSTOM_MODAL_PROPS['TOOLBAR_SNAPSHOT']
            )
          }
        >
          <i className="fa fa-camera fa-2x" />{' '}
        </Button>
        <Button
          id="wv-info-button"
          title="Information"
          className={'wv-toolbar-button' + notificationClass}
          onClick={() =>
            openModal('TOOLBAR_INFO', CUSTOM_MODAL_PROPS['TOOLBAR_INFO'])
          }
          datacontent={notificationContentNumber}
        >
          <i className="fa fa-info-circle fa-2x" />{' '}
        </Button>
      </ButtonToolbar>
    );
  }
}
function mapStateToProps(state) {
  const { number, type } = state.notifications;

  return {
    notificationType: type,
    notificationContentNumber: number
  };
}
const mapDispatchToProps = dispatch => ({
  openModal: (key, customParams) => {
    dispatch(openCustomContent(key, customParams));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LinksContainer);

LinksContainer.propTypes = {
  openModal: PropTypes.func
};
