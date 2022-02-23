const Tx = require("ethereumjs-tx").Transaction;
const Web3 = require("web3"); //로컬 말고 Web3로 배포
const abi = require("../public/js/contractabi.json");
const web3 = new Web3(
  "https://ropsten.infura.io/v3/3c52917848e945229c0d33d632b10490"
); //ropsten 사용

const account = "0x8f9C4Ea42B64b3d3C75eCf8670fE2DdEEFC1354A";

// const account = web3.eth.accounts[0];
// console('account : ' + account);
// web3.etth.getBalance(account, (error, balance) => {
//    if (!error)
//         console.log('getBalance:' + balance);
// }

const privateKey = Buffer.from(
  "8c985b3176f99e0625d07819658e2deac60382cabf282e1a8dc796f77f6f130b",
  "hex"
);
const contractAddress = "0x0ee196e41545943C34a046F38936ddD4599edDfa";
const contract = new web3.eth.Contract(abi, contractAddress);

const bodyParser = require("body-parser");

module.exports = function (app) {
  app.use(bodyParser.json()); // to support JSON-encoded bodies
  app.use(
    bodyParser.urlencoded({
      // to support URL-encoded bodies
      extended: true,
    })
  );

  app.get("/", function (req, res) {
    res.render("index.html");
  });

  app.post("/getNumber", function (req, res) {
    //res.render('about.html');
    console.log("getNumber...");
    contract.methods
      .getNumOfProducts()
      .call()
      .then((length) => {
        console.log(" Value before increment: " + length);
        var response = {
          result: "true",
          getNumOfProducts: result,
        };

        console.log("response : " + response);

        res.status(200).json(response);
      }); // end of .then
  }); // end of app.post

  app.get("/listall", function (req, res) {
    //res.render('about.html');
    console.log("listall...");
    // const getNumber = req.body.getNumber;
    contract.methods
      .getAllproducts()
      .call()
      .then((productes) => {
        console.log(" Value productes: " + productes);
        var response = {
          result: "true",
          getLists: productes,
        };

        console.log("response : " + response);
        res.status(200).json(response);
      }); // end of .then
  }); // end of app.post

  app.get("/list", function (req, res) {
    //res.render('about.html');
    console.log("list...");
    // const getNumber = req.body.getNumber;
    contract.methods
      .getNumOfProducts()
      .call()
      .then((length) => {
        console.log(" Value before increment: " + length);
        // for (var i = 0; i < length; i++) {
        contract.methods
          .getProductStruct(length - 1)
          .call()
          .then((value) => {
            let list =
              value[0] + ", " + value[1] + ", " + value[2] + ", " + value[3];
            console.log(
              " value: ",
              value[0] + ", " + value[1] + ", " + value[2] + ", " + value[3]
            );
            var response = {
              result: "true",
              getLists: list,
            };

            console.log("response : " + response);
            res.status(200).json(response);
          }); // end of .then (value)
      }); // end of .then
    // }
  }); // end of app.post

  app.post("/submit", function (req, res) {
    console.log("submit : ", req.body);
    const number = req.body.pronumber;
    const name = req.body.proname;
    const location = req.body.proloc;
    console.log("number : " + number + ", " + name + ", " + location);

    const contractFunction = contract.methods.addProStru(
      number,
      name,
      location
    );
    const functionAbi = contractFunction.encodeABI();

    web3.eth.getTransactionCount(account).then((_nonce) => {
      const txParams = {
        nonce: web3.utils.toHex(_nonce),
        gasPrice: web3.utils.toHex(web3.utils.toWei("4", "gwei")),
        gasLimit: web3.utils.toHex(210000),
        from: account,
        to: contractAddress,
        data: functionAbi,
      };

      const tx = new Tx(txParams, { chain: "ropsten" });
      tx.sign(privateKey);
      serializedTx = tx.serialize();

      contract.methods
        .getNumOfProducts()
        .call()
        .then((result) => console.log(" Value before increment: " + result));

      web3.eth
        .sendSignedTransaction("0x" + serializedTx.toString("hex"))
        .on("receipt", (receipt) => {
          console.log("receipt :", receipt);
          contract.methods
            .getNumOfProducts()
            .call()
            .then((length) => {
              console.log(" getNumOfProducts: " + length);
            });
          var response = {
            result: "true",
            blockHash: receipt.blockHash,
            transactionHash: receipt.transactionHash,
          };

          res.status(200).json(response);
          console.log("response : " + response);
        }); // end of on('receipt')
    }); // web3.eth.getTransactionCount
  }); //end of app.post
}; // end of module
