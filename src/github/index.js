const github = require("./github-api")

const getAllIssue = async () => {
    const { data } = await github.getIssueList({ state: "open" });
    return data
}
const getLastIssue = async () => {
    const { data } = await github.getIssueList({ state: "open" });
    let lastIssues = data[data.length-1]
    return {
        title: lastIssues.title,
        html_url: lastIssues.html_url
    }
}
module.exports = {
    getAllIssue,
    getLastIssue
}
