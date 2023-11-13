import { useState } from 'react'

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  const addRating = (rating, func) => {
    return (
      () => func(rating + 1)
    )
  }


  // const addGood = () => {
  //   setGood(good + 1)
  // }

  // const addNeutral = () => {
  //   setNeutral(neutral + 1)
  // }

  // const addBad = () => {
  //   setBad(bad + 1)
  // }

  return (
    <div>
      <Heading text="give feedback"/>
      <Button text="good" onClick={addRating(good, setGood)} />
      <Button text="neutral" onClick={addRating(neutral, setNeutral)} />
      <Button text="bad" onClick={addRating(bad, setBad)} />
      <Heading text="statistics"/>
      <Statistics good={good} neutral={neutral} bad={bad}/>
      
    </div>
  )
}

const Heading = ({text}) => {
  return (
    <h1>{text}</h1>
  )
}

const Button = ({onClick, text}) => {
  return (
    <button onClick={onClick}>
      {text}
    </button>
  )
}

const Statistics = ({good, bad, neutral}) => {
  const all = good + bad + neutral
  const average = (good - bad) / all
  const positive = good / all * 100 + ' %'

  if (all == 0) {
    return (<p>No feedback given</p>)
  }

  return (
    <table>
      
      <StatisticLine text="good" value={good} />
      <StatisticLine text="neutral" value={neutral}/>
      <StatisticLine text="bad" value={bad}/>
      <StatisticLine text="all" value={all}/>
      <StatisticLine text="average" value={average}/>
      <StatisticLine text="positive" value={positive}/>        
      

    </table>
  )

}

const StatisticLine = ({text, value}) => {

  return (
    <tbody>
      <tr>
        <td>{text}</td>
        <td>{value}</td>
      </tr>
    </tbody>
  )

}




export default App