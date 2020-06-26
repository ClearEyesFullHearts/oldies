var art = require('./details/article');
var cat = require('./details/category');
var mail = require('./details/mail');
var login = require('./details/login');
var pay = require('./details/payment');
var misc = require('./details/misc');
var order = require('./details/order');

exports.categories = cat.categories;
exports.category = cat.category;

exports.articles = art.all_articles;
exports.articlesByCategory = art.category;
exports.articleByRef = art.getReference;
exports.createArticle = art.addReference;
exports.modifyArticle = art.modReference;
exports.removeArticle = art.delReference;

exports.createColorImage = art.addColorImage;
exports.removeColorImage = art.delColorImage;
exports.createSizePrice = art.addSizePrice;
exports.removeSizePrice = art.delSizePrice;
exports.disponible = art.isAvailable;
exports.notDisponible = art.isNotAvailable;

exports.weights = misc.poids;
exports.countries = misc.pays;
exports.port = misc.fraisPortPays;

exports.mailContact = mail.sendContact;
exports.mailConfirm = mail.sendInvoiceConfirmation;
exports.mailError = mail.sendErrorLog;

exports.findAllUsers = login.getAllUsers;
exports.findUser = login.getOneUser;
exports.loggingIn = login.logIn;
exports.loggingOut = login.logOut;
exports.createLog = login.newLog;
exports.confirmUser = login.confirmLog;
exports.updateUser = login.modifyUser;
exports.deleteUser = login.removeUser;
exports.isLoggedIn = login.userExistsInCache;
exports.resetLog = login.resetPassword;
exports.modifyLog = login.changePassword;

exports.payCanceled = pay.canceled;
exports.payResponse = pay.response;
exports.payResponseAuto = pay.auto;

exports.getOrder = order.findOrder;
exports.newOrder = order.createClientOrder;
exports.preparationStatus = order.orderInPreparation;
exports.deliveryStatus = order.orderInDelivery;
exports.closedStatus = order.orderClosed;
exports.canceledStatus = order.orderCanceled;
exports.getOrders = order.findClientOrders;
exports.getAdminOrders = order.findAdminOrders;
exports.getAdminClientOrders = order.findAdminClientOrders;