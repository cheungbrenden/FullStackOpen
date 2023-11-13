import { useState } from 'react'

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 10 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when diagnosing patients.',
    'The only way to go fast, is to go well.'
  ]
   
  const [selected, setSelected] = useState(0)
  const [votes, setVotes] = useState(Array(anecdotes.length).fill(0))
  
  const indexOfMostVotes = votes.indexOf(Math.max(...votes))

  const voteAnecdote = () => {
    const votesCopy = [...votes]
    votesCopy[selected] += 1
    setVotes(votesCopy)
  }

  const randomAnecdote = () => {
    const randomNumber = Math.floor(Math.random() * anecdotes.length)
    setSelected(randomNumber)
  }


  return (
    <div>
      <Heading text="Anecdote of the day" />
      <Anecdote anecdote={anecdotes[selected]} voteCount={votes[selected]} />
      
      <br/>
      <VoteButton onClick={voteAnecdote}/>
      <NextButton onClick={randomAnecdote}/>
      <Heading text="Anecdote with most votes" />
      <Anecdote anecdote={anecdotes[indexOfMostVotes]} voteCount={votes[indexOfMostVotes]} />
    </div>
  )
}

const Anecdote = ({anecdote, voteCount}) => {

  return (
    <>
      <p>{anecdote}</p>
      <p>has {voteCount} votes</p>
    </>
  )
}

const VoteButton = ({onClick}) => {
  return (
    <button onClick={onClick}>vote</button>
  )
}

const NextButton = ({onClick}) => {
  return (
    <button onClick={onClick}>next anecdote</button>
  )
}

const Heading = ({text}) => {
  return (
    <h1>{text}</h1>
  )
}
export default App