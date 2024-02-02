const lodash = require('lodash')


const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.length === 0
        ? 0
        : blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.length === 0
        ? null
        : blogs.reduce((mostLikedBlog, blog) => mostLikedBlog.likes > blog.likes ? mostLikedBlog : blog)
}

const mostBlogs = (blogs) => {

    if (blogs.length === 0) return null

    // console.log(lodash.chain(blogs)
    // .countBy('author')
    // .entries()
    // .maxBy((o) => o[1]) // same thing as lodash.last but hardcoded
    // .value()
    const mostBlogCount = lodash.chain(blogs)
        .countBy('author')
        .entries()
        .maxBy(lodash.last)
        .value()

    return {
        author: mostBlogCount[0],
        blogs: mostBlogCount[1]
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return null

    const groupedBlogs = lodash.groupBy(blogs, 'author')

    const countedAuthors = lodash.map(groupedBlogs, (arr) => {
        return {
            author: arr[0].author,
            likes: lodash.sumBy(arr, 'likes'),
        }
    })
    
    const maxLikesAuthor = lodash.maxBy(countedAuthors, author => author.likes)

    return {
        author: maxLikesAuthor.author,
        likes: maxLikesAuthor.likes
    }
}



module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}