import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import "./StrategyForm.css"

import StrategyFormAdditionalParameters from "./StrategyFormAdditionalParameters";

import { prepareAllStrategies, parseAdditionalParameters } from "../../utils/formUtils.js";


function StrategyForm(props) {
  var defaultStategyForm = {"initial_investment": 1000, "regular_investment": 100, "regular_investment_frequency": "months", "strategy": null, "start_date": props.earliestStartDate};
  const regularInvestmentFrequency = ["days", "weeks", "fortnights", "months", "quarters", "years"]

  const [strategyForm, setStrategyForm] = useState(defaultStategyForm);
  const [allStrategies, setAllStrategies] = useState({})
  const [selectedStrategy, setSelectedStrategy] = useState(null)

  useEffect(() => {
    fetch('/api/get_all_strategies/')
      .then(res => res.json())
      .then(
          (data) => {
            const additionalParameters = {}
            Object.values(data["strategies"]).forEach(strategy => {strategy.forEach(parameter => {additionalParameters[parameter.name] = parameter.default})});
            setAllStrategies(prepareAllStrategies(data["strategies"])); 
            setStrategyForm({ ...strategyForm, ...additionalParameters, "strategy": Object.keys(data["strategies"])[0] })
          },
          (error) => {console.log('Get all strategies failed');}
      )
  }, []);

  useEffect(() => {
    setStrategyForm({ ...strategyForm, "start_date": props.earliestStartDate })
  }, [props.earliestStartDate])

  function handleChange(e){
    const { name, value } = e.target
    setStrategyForm({ ...strategyForm, [name]: value })
  }

  function handleFormSubmit(e){
      e.preventDefault();

      props.setRunningStrategy(true);

      // If running compared strategies send all strategies, else send form data.
      let strategyFormData = {};
      if (Object.keys(props.strategyComparisons).length > 0) {
        strategyFormData = {"strategy": parseAdditionalParameters(props.strategyComparisons, allStrategies)};
      }
      else {
        console.log(strategyForm);
        strategyFormData = {"strategy": parseAdditionalParameters({"default": strategyForm}, allStrategies)};
      }

      // Add symbol from loaded data to form
      const formattedStrategyFormData = {"strategy": strategyFormData.strategy, "ticker": props.symbol}

      fetch('/api/post_strategy/', {
        method: 'POST',
        body: JSON.stringify(formattedStrategyFormData),
        headers: {
            'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(
          (data) => {props.setStrategyData(data); props.setRunningStrategy(false);},
          (error) => {console.log('Strategy failed'); props.setRunningStrategy(false);}
      )
  }

  function addToCompare(){
    // Get number of occurences of new strategy in comparison and increment the name as the new id.
    var lastInstanceId = 0;
    for (const strategy in props.strategyComparisons){
      if (strategyForm.strategy === props.strategyComparisons[strategy].strategy) {
        let strategyNameSplit = strategy.split("_");
        lastInstanceId = parseInt(strategyNameSplit[strategyNameSplit.length - 1]);
      }
    }
    const strategyName = `${strategyForm.strategy}_${lastInstanceId + 1}`
    props.setStrategyComparisons({ ...props.strategyComparisons, [strategyName]: strategyForm })
    setStrategyForm(defaultStategyForm);
    setStrategyForm({...strategyForm, "strategy": `${allStrategies ? Object.keys(allStrategies)[0] : null}`});
  }

  function changeSelectedStrategy(e){
    if (selectedStrategy && e.target.value == selectedStrategy) {
      setSelectedStrategy(null);
    }
    else {
      setSelectedStrategy(e.target.value);
      setStrategyForm(props.strategyComparisons[e.target.value])
    }
  }

  function removeSelectedStrategy(e){
    // Remove strategy from strategyComparisons
    props.setStrategyComparisons(Object.fromEntries(Object.entries(props.strategyComparisons).filter(([key]) => key !== e.target.value)))
    setSelectedStrategy(null);
  }

  return (
    <div className={props.runningStrategy ? "faded": ""}>
      {Object.keys(props.strategyComparisons).length > 0 ?
        <div className={"p-3"}>
          <h5>Compared Strategies</h5>
          <div className={"strategyComparisons"}>
            {Object.keys(props.strategyComparisons).map((strategy) =>
              <div className={"w-100 strategyComparisonOption"} key={strategy}>
                <Button className={"m-1 strategyComparisonOptionButton " + `${selectedStrategy === strategy ? 'active' : ""}`} value={strategy} key={`select_${strategy}`} onClick={(e) => {changeSelectedStrategy(e)}}>{strategy}</Button>
                <Button className={"m-1 strategyComparisonOptionRemoveButton"} value={strategy} key={`delete_${strategy}`} onClick={(e) => {removeSelectedStrategy(e)}}>X</Button>
              </div>
            )}
          </div>
        </div>
        : null
      }
    
      <Form className={"p-3"} onSubmit={handleFormSubmit}>
        <h5>{selectedStrategy ? `Updating ${selectedStrategy}` : "Create New Strategy"}</h5>

        <Form.Group className="mb-2">
          <Form.Label>Initial Investment ({props.currency})</Form.Label>
          <Form.Control type="number" name="initial_investment" value={strategyForm.initial_investment} onChange={(e) => {handleChange(e)}} required />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Regular Investment ({props.currency})</Form.Label>
          <Form.Control type="number" name="regular_investment" value={strategyForm.regular_investment} onChange={(e) => {handleChange(e)}} required />
        </Form.Group>

        <Row>
          <Col lg={6}>
            <Form.Group className="mb-2">
              <Form.Label>Frequency</Form.Label>
              <Form.Select name="regular_investment_frequency" value={strategyForm.regular_investment_frequency} onChange={(e) => {handleChange(e)}} disabled={!strategyForm.strategy || strategyForm.regular_investment === "0"}>
                {regularInvestmentFrequency.map((freq) => <option value={freq} key={freq}>{freq}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col lg={6}>
            <Form.Group className="mb-2">
              <Form.Label>Start date</Form.Label>
              <Form.Control type="date" name="start_date" value={strategyForm.start_date} min={props.earliestStartDate} max={props.latestEndDate} onChange={(e) => {handleChange(e)}} required />
            </Form.Group>
          </Col>
        </Row>

        {Object.keys(allStrategies).length > 0 ? 
          <>
            <Form.Group className="mb-2">
              <Form.Label>Strategy</Form.Label>
              <Form.Select name="strategy" value={strategyForm.strategy} onChange={(e) => {handleChange(e)}}>
                {Object.keys(allStrategies).map((strategy) => <option value={strategy} key={strategy}>{allStrategies[strategy].name}</option>)}
              </Form.Select>
            </Form.Group>

            <StrategyFormAdditionalParameters
              strategyForm={strategyForm}
              handleChange={handleChange}
              additionalParameters={allStrategies[strategyForm.strategy].additionalParameters}
            />
          </>
          : null
        }

        <div className={"mt-2 w-100"}>
          <Button variant="secondary" type="button" className={"w-100"} onClick={selectedStrategy ? () => {props.setStrategyComparisons({ ...props.strategyComparisons, [selectedStrategy]: strategyForm }); setSelectedStrategy(null);} : () => {addToCompare()}}>
            {selectedStrategy ? "Save Strategy" : "Add to Compare"}
          </Button>

          {selectedStrategy ?
            <div className={"mt-2 w-100"}>
              <Button variant="danger" type="button" className={"w-100"} value={selectedStrategy} onClick={(e) => removeSelectedStrategy(e)}>
                Remove Strategy
              </Button>
            </div>
            : null
          }
        </div>

        {!selectedStrategy ?
          <Button variant="primary" type="submit" className={"mt-2 w-100"}>
            {Object.keys(props.strategyComparisons).length > 0 ? "Run Compared Strategies" : "Run Strategy"}
          </Button>
          : null
        }
      </Form>
    </div>
  );
}

export default StrategyForm