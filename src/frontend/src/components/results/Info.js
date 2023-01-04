import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';

import './Info.css';

import { formatNumber } from '../../utils/resultsUtils.js';

function Info(props) {
  const [logoFailed, setLogoFailed] = useState(false);

  // When info changes - reset logoFailed to false
  useEffect(() => {
    setLogoFailed(false);
  }, [props.info])

  return (
    <>
      <Container className={"tickerInfo w-100 mb-2"}>
        {!logoFailed ?
          <img
            src={props.info.logo_url}
            onError={() => {setLogoFailed(true);}}
            alt="Logo"
            width="40"
            height="40"
          />
        : null
        }
        <h5 className={"m-0 px-3"}>{props.info.shortName} ({props.info.symbol})</h5>
      </Container>

      <div className={"tickerInfoPrice"}>
          Current price: {props.currency}{props.info.currentPrice ? formatNumber(props.info.currentPrice) : formatNumber(props.info.regularMarketPrice)}
      </div>
    </>
  );
}

export default Info