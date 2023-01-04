import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import "../app/App.css";
import "./TickerForm.css";

function TickerForm(props) {
    const suggestedTickers = ["^GSPC", "TSLA", "MSFT"]

    function handleChange(e){
        props.setTicker(e.target.value);
    }

    function loadTickerSuggestion(e){
      props.setTicker(e.target.value)
      
      fetch('/api/get_data/?ticker=' + e.target.value)
      .then(res => res.json())
      .then(
          (data) => {props.setStrategyData({}); props.setData(data); props.setChangingData(true); props.setMinSliderDateIndex(0); props.setMaxSliderDateIndex(data.data["Date"].length-1)},
          (error) => {console.log('Ticker failed to load');}
      )
    }

    function handleFormSubmit(e){
        e.preventDefault();

        fetch('/api/get_data/?ticker=' + props.ticker)
            .then(res => res.json())
            .then(
                (data) => {props.setStrategyData({}); props.setData(data); props.setChangingData(true); props.setMinSliderDateIndex(0); props.setMaxSliderDateIndex(data.data["Date"].length-1)},
                (error) => {alert('The ticker does not exist, please try another');}
        )
    }

    return (
      <div className={"p-3 " + (props.runningStrategy ? "faded": "")}>
        <h5>Ticker</h5>
        <Form onSubmit={handleFormSubmit}>
          <Row className="mx-auto mb-2 w-100">
            <Col lg={7} className={"p-1"}>
              <Form.Group className={"w-100"}>
                <Form.Control type="text" value={props.ticker} onChange={(e) => {handleChange(e)}} required />
              </Form.Group>
            </Col>

            <Col lg={5} className={"p-1"}>
              <Button variant="primary" type="submit" className={"w-100"}>
                Search
              </Button>
            </Col>
          </Row>
        </Form>

          <div className={"tickerSuggestions"}>
            {suggestedTickers.map((ticker) => {
              return <Button className={"tickerSuggestion mx-1"} variant="danger" size="sm" key={ticker} value={ticker} onClick={(e) => {loadTickerSuggestion(e)}}>{ticker}</Button>
            })}
          </div>
      </div>
    );
  }

export default TickerForm