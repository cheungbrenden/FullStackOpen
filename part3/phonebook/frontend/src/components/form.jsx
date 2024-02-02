/* eslint-disable react/prop-types */
const PersonForm = ({addPerson, newName, newNumber, handlePersonChange, handleNumberChange}) => {
    
    return (
        <form onSubmit={addPerson}>
            <div>
                name: <input required value={newName} onChange={handlePersonChange} />
            </div>
            <div>
                number: <input required value={newNumber} onChange={handleNumberChange} />
            </div>
            <div>
                <button type="submit">add</button>
            </div>
        </form>
    )
}

export default PersonForm