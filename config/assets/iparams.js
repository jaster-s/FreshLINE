let ACTIVATE_KEY;
let DATA_LINE = [];
let idHandle;
let Domain;
let SERVER = config.server_url
let groupData = []
let agentData = []
let API_KEY;
let FreshdeskID;
let singUp = false;
let isValid = false;

$(document).ready(async function () {
  $("#backToContentTable").click(function () {
    clearForm()
    clearValidate()
    $("#content-table").show();
    $("#content-form").hide();
  });
  onChangeInput()
  onHandleGroup()

  $("#confirmDelete").click(function () {
    removeLine();
    $(".main-modal").removeClass("active");
  });

  $("#confirmCopy").click(function () {
    copyLine();
    $(".main-copy").removeClass("active");
  });
});

function openToast(status, msg) {
  $(".toast-body").removeClass('error success')
  $(".toast-body").text(msg)
  setTimeout(() => {
    $(".custom-toast").addClass(`active ${status}`)
  }, 500);
  setTimeout(() => {
    $(".custom-toast").removeClass('active')
  }, 5000);
}

function addMore() {
  $("#btn-form-add").show();
  $("#btn-form-edit").hide();
  $("#content-table").hide();
  $("#content-form").show();
}

function successCRUD() {
  $("#content-table").show();
  $("#content-form").hide();
  clearForm()
}

function signUp() {
  $("#singUp").removeClass("d-none");
  singUp = true;
  $("#singIn").addClass("d-none");
}

function signIn() {
  $("#singUp").addClass("d-none");
  singUp = false;
  $("#singIn").removeClass("d-none");
}

async function CreateUser() {
  $("#main-load").addClass('active')
  let options = {
    headers: { "x-signature": "w3vv1dmM0aYcN7KNW2ep" }
  }
  let body = {
    company: $("#company").val().trim(),
    mail: $("#email").val().trim(),
    first_name: $("#firstName").val().trim(),
    last_name: $("#lastName").val().trim(),
    phone: $("#phone").val().trim(),
    version: "trial",
  };
  url = `${SERVER}user/create/trial`
  await axios.post(url, body, options)
    .then(
      function (res) {
        $("#main-load").removeClass('active')
        ACTIVATE_KEY = res.data;
      })
    .catch((res) => {
      openToast('error', 'Failed to connected API')
    });
}

function clearForm() {
  $("#name").attr("readonly", false);
  $("#client_id").attr("readonly", false);
  $("#client_secret").attr("readonly", false);
  $("#name").val('');
  $("#client_id").val('');
  $("#client_secret").val('');
  $("#group_name").find(":selected").val();
  $("#agent_name").find(":selected").val();
  $('.select-test').attr("selected", "selected");
  $('#group_name').val("0");
  $('#agent_name').val("0");
  $("#recoveryMail").val('');
}

function expiration_date(data) {
  if (data.expirationDate > 7) {
    if (data.version == "trial") {
      $("#expiration-date").html("API Key will be expired in " + data.expirationDate + " day(s)");
      $("#expiration-date").css("font-size", "12px")
    } else {
      // $("#expiration-date").html("You Activate Key ends in" + data.expirationDate + " day");
    }
  } else if ((data.expirationDate >= 0)) {
    $("#expiration-date").html("API Key will be expired in " + data.expirationDate + " day(s)");
    $("#expiration-date").css("color", "#CC6600")
    $("#expiration-date").css("font-size", "12px")
  } else {
    $("#expiration-date").html("API Key has been expired.");
    $("#expiration-date").css("color", "#CC0000")
    $("#expiration-date").css("font-size", "12px")
  }
}

function initTable(data) {
  $("#tblBody").empty();
  data.forEach((v, i) => {
    console.log(v);
    if (v.group_id != 0) {
      var group = groupData.find((value) => v.group_id == value.id);
    }
    if (v.responder_id != 0) {
      var agent = agentData.find((value) => v.responder_id == value.id)
    }

    let row = `<tr id="row${i + 1}">
        <td class="id" style="width:10%;">${i + 1}</td>
        <td style="width:20%;">${v.line_name}</td>
        <td style="width:15%;">${v.client_id}</td>
        <td style="width:30%;" class="text-center">${v.group_id != 0 ? group.name : '-'} / ${v.responder_id != 0 ? agent.contact.name : '- '}</td>
        <td style="width:25%;" class="action text-center">
          <button class="btn btn-success text-white" onclick="copyWebhook(value)" id="test" value="${v._id}"><i class="fas fa-code" data-id="${i}"></i></button>
          <button class="btn btn-warning text-white" onclick="editData(value)" id="test" value="${v._id}"><i class="fa fa-pen"></i></button>
          <button class="btn btn-danger deleteButton"  onclick="deleteData(value)" value="${v._id}"><i class="fa fa-trash-alt" data-id="${i}"></i></button>
        </td>
      </tr>`;
    $("#tblBody").append(row);
  })
}
//เวลากด edit จะดึงค้าเข้ามาใส่ใน input
function editData(id) {
  $("#btn-form-add").hide();
  $("#btn-form-edit").show();
  data = DATA_LINE.find((v) => v._id == id);
  $("#content-form").show();
  $("#content-table").hide();
  $("#LINE_obj_Id").val(data._id);
  $("#name").val(data.line_name).prop("readonly", true);
  $("#client_id").val(data.client_id).prop("readonly", true);
  $("#client_secret").val(data.client_secret).prop("readonly", true);
  $('#group_name option').removeAttr('selected').filter(`[value=${data.group_id}]`).attr('selected', true)
  $('#agent_name option').removeAttr('selected').filter(`[value=${data.responder_id}]`).attr('selected', true)
  $("#recoveryMail").val(data.recovery_mail);
  $("#auto_reply").val(data.auto_message_reply);
}

async function copyWebhook(id) {
  let Webhook;
  $("#main-load").addClass('active')
  data = DATA_LINE.find((v) => v._id == id);
  $("#LINE_obj_Id").val(data._id);
  let body = {
    line_obj_id: $("#LINE_obj_Id").val(),
  };
  let config = {
    headers: {
      "x-signature": CreateSignature(JSON.stringify(body)),
    },
  };
  await axios
    .post(`${SERVER}line_oa/webhook`, body, config)
    .then(async (res) => {
      if (res.status === 200) {
        await getLine()
        successCRUD()
        Webhook = res.data.webhook
      }
    })
    .catch(function () {
      $("#main-load").removeClass('active')
      openToast('error', 'Failed to load data')
    });
  $(".main-copy").show()
  $(".main-copy").addClass("active");

  $("#webHook").val(Webhook);

  $("#x-cancel-copy").click(() => {
    $(".main-copy").removeClass("active");
  })
}

function deleteData(id) {
  idHandle = id;
  $(".main-modal").show()
  $(".main-modal").addClass("active");

  $("#cancel-modal").click(function () {
    $(".main-modal").removeClass("active");
  });
  $("#x-cancel-modal").click(() => {
    $(".main-modal").removeClass("active");
  })
}

async function initDropDown() {
  initDropDownGroup()
  initDropDownAgent()
}

function initDropDownGroup() {
  let contentGroup = "";
  contentGroup += `<option value="0" class="select-default">Not selected</option>`;
  for (const value of groupData) {
    contentGroup += `<option value="${value.id}">${value.name}</option>`;
  }
  $("#group_name").html(contentGroup);

}

function initDropDownAgent() {
  let contentAgent = "";
  contentAgent += `<option value="0" class="select-default">Not selected</option>`;
  for (const value of agentData) {
    contentAgent += `<option value="${value.id}">${value.contact.name}</option>`;
  }
  $("#agent_name").html(contentAgent);
}

async function getDataAssignee(name) {
  return axios
    .get(`${Domain}api/v2/${name}`, {
      auth: {
        username: API_KEY,
        password: "X",
      },
    })
    .then((res) => res.data)
    .catch(function (error) {
      console.log("Get data fail", error);
    });
}

async function getLine() {
  $("#main-load").addClass('active')
  let config = {
    headers: {
      "x-signature": CreateSignature(""),
    },
  };
  await axios
    .get(`${SERVER}line_oa/list/LineOA`, config)
    .then((res) => {
      if (res.status == 200) {
        DATA_LINE = res.data;
        initTable(res.data);
      }
    })
    .catch(function (error) {
      openToast('error', 'ดึงข้อมูลไม่สำเร็จ')
    });
  await axios
    .get(`${SERVER}user/check/Expiration_ActivateKey`, config)
    .then((res) => {
      if (res.status == 200) {
        expiration_date(res.data);
      }
    })
    .catch(function (error) {
      openToast('error', 'ดึงข้อมูลไม่สำเร็จ')
    });
  $("#main-load").removeClass('active')
}

async function addLine() {
  let isValidate = validateLine()
  if (!isValidate) {
    return false
  }
  $("#main-load").addClass('active')
  let body = {
    name: $("#name").val().trim(),
    client_id: $("#client_id").val().trim(),
    client_secret: $("#client_secret").val().trim(),
    responder_id: parseInt($("#agent_name").find(":selected").val()),
    group_id: parseInt($("#group_name").find(":selected").val()),
    recovery_mail: $("#recoveryMail").val(),
    auto_message_reply: $("#auto_reply").val(),
  };
  let config = {
    headers: {
      "x-signature": CreateSignature(JSON.stringify(body)),
    },
  };
  await axios
    .post(`${SERVER}line_oa/add/LineOA`, body, config)
    .then(async (res) => {
      if (res.data.Result === true && res.data.LINEOA === true) {
        await getLine()
        successCRUD()
        openToast('success', 'Add data successfully')
      } else if (res.data.Result === false && res.data.LINEOA === true) {
        $("#main-load").removeClass('active')
        openToast('error', res.data.message)
      } else if (res.data.Result === true && res.data.LINEOA === false) {
        $("#main-load").removeClass('active')
        openToast('error', res.data.message)
      } else {
        $("#main-load").removeClass('active')
        openToast('error', res.data.message)
      }
    })
    .catch(function () {
      $("#main-load").removeClass('active')
      openToast('error', 'Failed to add data.')
    });
}

async function editLine() {
  let isValidate = validateLine()
  if (!isValidate) {
    return false
  }
  $("#main-load").addClass('active')
  let body = {
    line_obj_id: $("#LINE_obj_Id").val(),
    responder_id: parseInt($("#agent_name").find(":selected").val()),
    group_id: parseInt($("#group_name").find(":selected").val()),
    recovery_mail: $("#recoveryMail").val(),
    auto_message_reply: $("#auto_reply").val(),
  };

  let config = {
    headers: {
      "x-signature": CreateSignature(JSON.stringify(body)),
    },
  };
  axios
    .post(`${SERVER}line_oa/edit/LineOA`, body, config)
    .then(async (res) => {
      if (res.data.status === true) {
        await getLine()
        successCRUD()
        openToast('success', 'Update data successfully')
      } else {
        $("#main-load").removeClass('active')
        openToast('error', 'Failed to update data.')
      }
    })
    .catch(function () {
      $("#main-loadd").removeClass('active')
      openToast('error', 'Failed to update data.')
    });
}

async function copyLine() {
  $("#main-load").addClass('active')
  await getLine()
  successCRUD('success')
}

async function removeLine() {
  $("#main-load").addClass('active')
  let body = {
    line_obj_id: idHandle,
  };
  let config = {
    headers: {
      "x-signature": CreateSignature(JSON.stringify(body)),
    },
  };
  await axios
    .post(`${SERVER}line_oa/remove/LineOA`, body, config)
    .then(async (res) => {
      if (res.data.status === true) {
        await getLine()
        successCRUD('success')
        openToast('success', 'Remove data successfully')
      } else {
        $("#main-load").removeClass('active')
        openToast('error', 'Failed to remove data.')
      }
    })
    .catch(function (error) {
      $("#main-load").removeClass('active')
      openToast('error', 'Failed to remove data.')
    });
}

function validateActivateField() {
  let isValidate = true

  if ($("#domain").val() == '') {
    $(".domain").slideDown();
    $(".domain").html('Domain is require');
    $("#domain").addClass("err")
    isValidate = false
  }

  if ($("#apiKey").val() == '') {
    $(".apiKey").slideDown();
    $(".apiKey").html('API Key is require');
    $("#apiKey").addClass("err")
    isValidate = false
  }

  if ($("#activateKey").val() == '') {
    $(".activateKey").slideDown();
    $(".activateKey").html('Activate Key is require');
    $("#activateKey").addClass("err")
    isValidate = false
  }
  return isValidate
}

function validateCreateField() {
  let isValidate = true

  if ($("#domainCreate").val() == '') {
    $(".domainCreate").slideDown();
    $(".domainCreate").html('Domain is require');
    $("#domainCreate").addClass("err")
    isValidate = false
  }

  if ($("#apiKeyCreate").val() == '') {
    $(".apiKeyCreate").slideDown();
    $(".apiKeyCreate").html('API Key is require');
    $("#apiKeyCreate").addClass("err")
    isValidate = false
  }

  if ($("#company").val() == '') {
    $(".company").slideDown();
    $(".company").html('Company is require');
    $("#company").addClass("err")
    isValidate = false
  }
  if ($("#email").val() == '') {
    $(".email").slideDown();
    $(".email").html('Email is require');
    $("#email").addClass("err")
    isValidate = false
  }
  if ($("#firstName").val() == '') {
    $(".firstName").slideDown();
    $(".firstName").html('First name is require');
    $("#firstName").addClass("err")
    isValidate = false
  }
  if ($("#lastName").val() == '') {
    $(".lastName").slideDown();
    $(".lastName").html('Last name is require');
    $("#lastName").addClass("err")
    isValidate = false
  }
  if ($("#phone").val() == '') {
    $(".phone").slideDown();
    $(".phone").html('Phone is require');
    $("#phone").addClass("err")
    isValidate = false
  }
  return isValidate
}

function validateLine() {
  let isValidate = true

  if ($("#name").val() == '') {
    $(".name").slideDown();
    $(".name").html('Name is require');
    $("#name").addClass("err")
    isValidate = false
  }

  if ($("#client_id").val() == '') {
    $(".client_id").slideDown();
    $(".client_id").html('Client ID is require');
    $("#client_id").addClass("err")
    isValidate = false
  }

  if ($("#client_secret").val() == '') {
    $(".client_secret").slideDown();
    $(".client_secret").html('Client Secret is require');
    $("#client_secret").addClass("err")
    isValidate = false
  }
  if ($("#recoveryMail").val() == '') {
    $(".recoveryMail").slideDown();
    $(".recoveryMail").html('Recover email is require');
    $("#recoveryMail").addClass("err")
    isValidate = false
  } else {
    if (!$('#recoveryMail').val().includes('@')) {
      $(".recoveryMail").slideDown();
      $(".recoveryMail").html('Please include an @ in the email address.');
      $("#recoveryMail").addClass("err")
    } else if (!$('#recoveryMail').val().includes('.')) {
      $(".recoveryMail").slideDown();
      $(".recoveryMail").html('Please include an . in the email address.');
      $("#recoveryMail").addClass("err")
    } else if (!$('#recoveryMail').val().includes('@') && !$('#recoveryMail').val().includes('.')) {
      $(".recoveryMail").slideDown();
      $(".recoveryMail").html('Please include an @ and . in the email address.');
      $("#recoveryMail").addClass("err")
    }
  }

  return isValidate
}

function onChangeInput() {
  $('#name').on('input', () => {
    if ($('#name').val() != '') {
      $(".name").hide();
      $("#name").removeClass("err")
    } else {
      $(".name").slideDown();
      $(".name").html('Name is require');
      $("#name").addClass("err")
    }
  });

  $('#client_id').on('input', () => {
    if ($('#client_id').val() != '') {
      $(".client_id").hide();
      $("#client_id").removeClass("err")
    } else {
      $(".client_id").slideDown();
      $(".client_id").html('Client is require');
      $("#client_id").addClass("err")
    }
  });

  $('#client_secret').on('input', () => {
    if ($('#client_secret').val() != '') {
      $(".client_secret").hide();
      $("#client_secret").removeClass("err")
    } else {
      $(".client_secret").slideDown();
      $(".client_secret").html('Client Secret is require');
      $("#client_secret").addClass("err")
    }
  });

  $('#recoveryMail').on('input', () => {
    if ($('#recoveryMail').val() != '') {
      if ($('#recoveryMail').val().includes('@') && $('#recoveryMail').val().includes('.')) {
        $(".recoveryMail").hide();
        $("#recoveryMail").removeClass("err")
      } else {
        $(".recoveryMail").slideDown();
        $(".recoveryMail").html('Please include an @ and . in the email address.');
        $("#recoveryMail").addClass("err")
      }
    } else {
      $(".recoveryMail").slideDown();
      $(".recoveryMail").html('Recover email is require');
      $("#recoveryMail").addClass("err")
    }
  });

  $('#apiKey').on('input', () => {
    if ($('#apiKey').val() != '') {
      $(".apiKey").hide();
      $("#apiKey").removeClass("err")
    } else {
      $(".apiKey").slideDown();
      $(".apiKey").html('API Key is require');
      $("#apiKey").addClass("err")
    }
  });

  $('#domain').on('input', () => {
    if ($('#domain').val() != '') {
      $(".domain").hide();
      $("#domain").removeClass("err")
    } else {
      $(".domain").slideDown();
      $(".domain").html('Domain is require');
      $("#domain").addClass("err")
    }
  });

  $('#activateKey').on('input', () => {
    if ($('#activateKey').val() != '') {
      $(".activateKey").hide();
      $("#activateKey").removeClass("err")
    } else {
      $(".activateKey").slideDown();
      $(".activateKey").html('APActivateI Key is require');
      $("#activateKey").addClass("err")
    }
  });
}

function clearValidate() {

  $(".name").hide();
  $("#name").removeClass("err")

  $(".client_id").hide();
  $("#client_id").removeClass("err")

  $(".client_secret").hide();
  $("#client_secret").removeClass("err")

  $(".recoveryMail").hide();
  $("#recoveryMail").removeClass("err")

  $(".domain").hide();
  $("#domain").removeClass("err")

  $(".activateKey").hide();
  $("#activateKey").removeClass("err")

  $(".apiKey").hide();
  $("#apiKey").removeClass("err")
}

async function listAllAgentInGroup(id) {
  return await axios
    .get(`${Domain}/api/v2/admin/groups/${id}/agents`, {
      auth: {
        username: API_KEY,
        password: "X",
      },
    })
    .then((res) => res.data)
    .catch(function (error) {
      console.log("Get data fail", error);
    });
}

async function onHandleGroup() {
  $("#group_name").change(async function () {
    if (this.value != "0") {
      agentData = await listAllAgentInGroup(parseInt($("#group_name").find(":selected").val()))
    } else {
      agentData = await getDataAssignee('agents')
    }
    initDropDownAgent();
  });
}

function copyText() {
  let copyText = document.getElementById("webHook");
  copyText.focus();
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
  // await navigator.clipboard.writeText(String(copyText.value)) ยังหาวิธีใช้ไม่ได้
}

function CreateSignature(body) {
  let signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(body, ACTIVATE_KEY))
  let signature_user = Base64.encode(FreshdeskID + "." + signature)
  return signature_user
}

