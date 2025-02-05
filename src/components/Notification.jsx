import PropTypes from 'prop-types';

const Notification = ({notification, className}) => {
    return (
        <div className={`notification ${className}`}><h6>{notification}</h6></div>
    )
}

Notification.propTypes = {
    notification: PropTypes.number,
    className: PropTypes.string
}

export default Notification;