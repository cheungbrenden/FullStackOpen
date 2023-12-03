import { useState, useEffect } from 'react'
import personsService from './services/persons'
import Filter from './components/search-filter'
import PersonForm from './components/form'
import Persons from './components/persons'
import Notification from './components/notification'
import axios from 'axios'


const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState(null)
  const [type, setType] = useState(null)

  useEffect(() => {
    personsService
      .getAll()
      .then(persons => setPersons(persons))
  }, [])

  const peopleToShow = persons.filter((person) => person.name.toLowerCase().includes(filter.toLowerCase()))


  const addPerson = (e) => {
    e.preventDefault()
    const searchDuplicatePerson = persons.find((person) => person.name == newName)

    if (searchDuplicatePerson != null) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        personsService
          .update(searchDuplicatePerson.id, { ...searchDuplicatePerson, number: newNumber })
          .then(updatedPerson => {
            setPersons(persons.map(person => person.id !== updatedPerson.id ? person : updatedPerson))
            setNewName('')
            setNewNumber('')
            setMessage(`Updated ${newName}`)
            setType("success")
            setTimeout(() => {
              setMessage(null)
              setType(null)
            }, 5000)
          })
          .catch(error => {
            if (error.name === 'TypeError') {
              setMessage(`Information of ${newName} has already been removed from the server`)
            }
            else {
              setMessage(error.response.data.error)
            }

            
            setType("fail")
            setTimeout(() => {
              setMessage(null)
              setType(null)
            }, 5000)
          })
      }
    }

    else if (persons.some((person) => person.number == newNumber)) {
      window.alert(`${newNumber} is already added to the phonebook`)
    }


    else {

      const personObject = { id: persons[persons.length - 1].id + 1, name: newName, number: newNumber }
      personsService
        .create(personObject)
        .then(person => {
          setPersons(persons.concat(person))
          setNewName('')
          setNewNumber('')
          setMessage(`Added ${person.name}`)
          setType("success")
          setTimeout(() => {
            setMessage(null)
            setType(null)
          }, 5000)
        })
        .catch(error => {
          // console.log(`This is my error messageaoweufuhowei: ${error.response.data.error}`)
          setMessage(error.response.data.error)
          setType("fail")
          setTimeout(() => {
            setMessage(null)
            setType(null)
          }, 5000)
        })
    }
  }

  const deletePerson = (deletedPerson) => {
    console.log(deletedPerson)
    if (window.confirm(`Delete ${deletedPerson.name}?`)) {
      personsService
        .deleteObject(deletedPerson.id)

      setPersons(persons.filter(person => person.id !== deletedPerson.id))
    }
  }


  const handlePersonChange = (e) => {
    setNewName(e.target.value)
  }

  const handleNumberChange = (e) => {
    setNewNumber(e.target.value)
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }



  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} type={type} />
      <Filter filter={filter} handleFilterChange={handleFilterChange} />

      <h2>add a new</h2>

      <PersonForm
        addPerson={addPerson}
        newName={newName}
        newNumber={newNumber}
        handlePersonChange={handlePersonChange}
        handleNumberChange={handleNumberChange}
      />

      <h2>Numbers</h2>
      <Persons peopleToShow={peopleToShow} deletePerson={deletePerson} />
    </div>
  )
}

export default App
