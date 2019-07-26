var Contract = require("./contractService"");

class Admin {
  constructor() {
    this.isInit = false;
  }

  async init() {
    if (this.isInit) {
      console.log("Already init")
      return;
    };
    this.isInit = true;
    this.contract = Contract()
    await this,contract.init()
  }
}

export default Admin
