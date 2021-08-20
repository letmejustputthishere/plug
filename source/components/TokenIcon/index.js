import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core';
import randomColor from 'random-color';

const useStyles = makeStyles(() => ({
  genericToken: {
    width: '41px',
    height: '41px',
    textAlign: 'center',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
  },
}));

function TokenIcon({
  image, symbol, className, tokenClassName, ...props
}) {
  const classes = useStyles();
  const color = randomColor({ luminosity: 'light' });
  const backgroundColor = `rgb(${color.values.rgb.join(',')})`;
  return (

    image
      ? <img src={image} className={className} {...props} />
      : (
        <div className={`${classes.genericToken} ${tokenClassName}`} style={{ backgroundColor }}>
          <span>{symbol}</span>
        </div>
      )

  );
}

TokenIcon.propTypes = {
  symbol: PropTypes.string.isRequired,
  image: PropTypes.string,
  className: PropTypes.string,
  tokenClassName: PropTypes.string,
};

TokenIcon.defaultProps = {
  image: null,
  className: '',
  tokenClassName: '',
};

export default TokenIcon;