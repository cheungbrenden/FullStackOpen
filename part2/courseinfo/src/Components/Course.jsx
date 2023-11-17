const Course = ({ course }) => {

    return (
        <>
            <Header courseName={course.name} />
            <Content parts={course.parts} />
            <Total parts={course.parts} />
        </>
    )

}

const Header = ({ courseName }) => <h1>{courseName}</h1>

const Total = ({ parts }) => {

    const total = parts.reduce((sum, part) => sum + part.exercises, 0)

    return (
        <b>total of {total} exercises</b>
    )
}



const Part = ({ part }) =>
    <p>
        {part.name} {part.exercises}
    </p>

const Content = ({ parts }) => {
    return (
        parts.map(part => <Part key={part.id} part={part} />)
    )
}

export default Course