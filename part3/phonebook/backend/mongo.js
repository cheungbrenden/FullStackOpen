const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://cheungbrenden:${password}@cluster0.bj1yocv.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model("Person", personSchema)


if (process.argv.length == 3) {
    // get the info
    
    Person.find({}).then(result => {
        console.log("phonebook:")
        result.forEach(element => {
            console.log(`${element.name} ${element.number}`)
        });
        mongoose.connection.close()
    })
}

if (process.argv.length == 5) {
    // save info into db
    const addedName = process.argv[3]
    const addedNumber = process.argv[4]
    
    const person = new Person({
        name: addedName,
        number: addedNumber
    })

    person.save().then(result => {
        console.log(`added ${addedName} number ${addedNumber} to phonebook`)
        mongoose.connection.close()
    })
}