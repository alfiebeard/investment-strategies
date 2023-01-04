import React from 'react';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { splitArrayIntoColumns } from '../../utils/formUtils';

function StrategyFormAdditionalParameters(props) {
  const numCols = 2;
  return (
    <>
      {splitArrayIntoColumns(props.additionalParameters, numCols).map((parameters) => (
        <Row key={"row" + parameters[0].name}>
          {parameters.map((parameter) => (
            <Col lg={parameters.length == numCols ? 12 / numCols : 12} key={parameter.name}>
              <Form.Group className="mb-2">
                <Form.Label>{parameter.label}</Form.Label>
                  <Form.Control type={parameter.type} name={parameter.name} value={props.strategyForm[parameter.name]} onChange={(e) => {props.handleChange(e)}} required />
              </Form.Group>
            </Col>
          ))}
        </Row>
      ))}
    </>
  );
}

export default StrategyFormAdditionalParameters