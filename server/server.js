const server = "https://6f82-58-136-199-93.ngrok.io"
const CryptoJS = require('crypto-js');
const { Base64 } = require('js-base64');


exports = {
  onTicketCreateCallback: function (args) {
    console.log("create Ticker");
    let reqBody = JSON.stringify(args);
    let options = {
      headers: { "Authorization": `Basic <%= encode('${args.iparams.api_key}:X') %>` }
    }
    let url = `${args.iparams.sub_Domain}api/v2/contacts/${args.data.ticket.requester_id}`;
    $request.get(url, options)
      .then(
        function (data) {
          let unique_external_id = JSON.parse(data.response).unique_external_id
          if (unique_external_id.trim() != null) {
            check = unique_external_id.split("_");
            if ((check.length == 2) && (check[1].charAt(0) == "U")) {
              let signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(reqBody, `${args.iparams.activate_Key}`));
              let signature_user = Base64.encode(`${args.iparams.freshdeskID}` + "." + signature);
              let options = {
                headers: { "x-signature": `${signature_user}` },
                body: reqBody
              }
              url = `${server}freshdesk_webhook/create`
              $request.post(url, options)
              
            }
          }
        }
      )
  },
  onConversationCreateCallback: function (args) {
    console.log("reply Ticker");
    let reqBody = JSON.stringify(args);
    let options = {
      headers: { "Authorization": `Basic <%= encode('${args.iparams.api_key}:X') %>` }
    }
    let url = `${args.iparams.sub_Domain}api/v2/contacts/${args.data.conversation.to_email_user_ids[0]}`;
    $request.get(url, options)
      .then(
        function (data) {
          let unique_external_id = JSON.parse(data.response).unique_external_id
          if (unique_external_id.trim() != null) {
            check = unique_external_id.split("_");
            if ((check.length == 2) && (check[1].charAt(0) == "U")) {
              let signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(reqBody, `${args.iparams.activate_Key}`));
              let signature_user = Base64.encode(`${args.iparams.freshdeskID}` + "." + signature);
              let options = {
                headers: { "x-signature": `${signature_user}` },
                body: reqBody
              }
              url = `${server}freshdesk_webhook/reply`
              $request.post(url, options);
            }
          }
        }
      )
  },
  onAppInstallCallback: function (args) {
    console.log("Install App");
    let reqBody = JSON.stringify(args);
    let signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(reqBody, `${args.iparams.activate_Key}`));
    let signature_user = Base64.encode(`${args.iparams.freshdeskID}` + "." + signature);
    let options = {
      headers: { "x-signature": `${signature_user}` },
      body: reqBody
    }
    url = `${server}freshdesk_webhook/appInstall`
    $request.post(url, options)
    renderData();
  },
  onAppUninstallCallback: function (args) {
    console.log("Uninstall");
    let reqBody = JSON.stringify(args);
    let signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(reqBody, `${args.iparams.activate_Key}`));
    let signature_user = Base64.encode(`${args.iparams.freshdeskID}` + "." + signature);
    let options = {
      headers: { "x-signature": `${signature_user}` },
      body: reqBody
    }
    url = `${server}freshdesk_webhook/appUninstall`
    $request.post(url, options)
    renderData();
  }
};