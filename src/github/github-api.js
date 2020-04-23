const GithubApi = require('github-api');
const config  = require("./config");

class GitHub {
  // github 的实例
  constructor() {
    this.github = null;
  }

  get githubInstance() {
    // 如果有 token，已经实例化过
    this.initGithubInstance(config.access_token);

    if (!this.github) {
      throw new Error("请先对 github-api 进行实例化");
    }
    return this.github;
  }

  // 获取对应发布仓库的 issue handler
  get issue() {
    return this.githubInstance.getIssues(config.OWNER, config.REPO_NAME);
  }

  setClient(github) {
    this.github = github;
    return this;
  }

  /**
   *
   * @param {*} token github token
   * @returns GitHub Api instance
   */
  initGithubInstance(token) {
    if (!this.github) {
      this.github = new GithubApi({ token });
    }

    return this;
  }

  getUserInfo() {
    return this.githubInstance.getUser().getProfile();
  }

  /**
   * 创建仓库 label
   * @param {*} name
   * @param {*} color
   * @param {*} description
   */
  createLabel({ color, name, description }) {
    return this.issue.createLabel({ color, name, description });
  }

  /**
   * 获取仓库 label 列表
   */
  getLabelList() {
    return this.issue.listLabels({ _: Date.now() });
  }

  /**
   *
   * @param {*} currentName 当前的名字
   * @param {Object} param 编辑的对象 name, color, description
   */
  updateLabel(currentName, { name, color, description }) {
    return this.issue.editLabel(currentName, { name, color, description });
  }

  /**
   * 删除 label
   * @param {*} name label 名字
   */
  deleteLabel(name) {
    return this.issue.deleteLabel(name);
  }

  getIssueList(params) {
    return this.issue.listIssues(params);
  }

  getIssue(id) {
    return this.issue.getIssue(id);
  }

  getIssueContent(id) {
    return this.issue.listIssueComments(id);
  }
}

module.exports = new GitHub();
