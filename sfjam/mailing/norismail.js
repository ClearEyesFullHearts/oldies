var nodemailer = require("nodemailer");
var fs = require('fs');

var config = require('../config/config');

var universalSender = config.mail.universalSender;
var norisContact = config.mail.norisContact;
var norisCommande = config.mail.norisCommande;

// create reusable transport method (opens pool of SMTP connections)

var norisTransport = nodemailer.createTransport("SMTP",{
    transport: "SMTP",
    host: "smtp.gmail.com",
    secureConnection: false,
    port: 587,
    requiresAuth: true,
    domains: ["gmail.com", "googlemail.com"],
    auth: {
        user: config.mail.transUser,
        pass: config.mail.transPass
    }
});

var sendNorisMail = function(fromM, toM, headerM, bodytxt, bodyHtml, callback){
    var mailOptions = {
        from: fromM,
        to: toM,
        subject: headerM
    }
    if(bodytxt){
        mailOptions.text = bodytxt;
    }
    if(bodyHtml){
        mailOptions.html = bodyHtml;
    }

    norisTransport.sendMail(mailOptions, function(error, responseStatus){
        if(!error){
            callback(true);
        }else{
            console.log(error);
            callback(false);
        }
    });
};

exports.sendContact = function(name, from, body, callback){
    sendNorisMail(universalSender, norisContact, "Demande contact de " + name + " : " + from, body, null, callback);
};
exports.sendConfirmClient = function(to, facture, callback){
    fs.readFile('mailing/templates/clientValidComm.html', 'utf8', function (err,data) {
        
        var txt = 'Cher ' + to.Prenom + ' ' + to.Nom + ',\n';
            txt += 'Nous vous confirmons la bonne réception de votre commande numéro ' + facture.comNum + 'ainsi que de votre paiement.\n';
            txt += 'Cette commande passée le ' + formatDateForBilling(new Date(facture.date)) + ' concerne ' + facture.caddie.articles.length + ' article(s) pour une valeur totale de ' + facture.amount + ' €.\n';
            txt += 'Vous pouvez retrouver le détail de cette commande sur ' + config.site.host + ' rubrique Mon compte puis Profil.\n';
            txt += 'Nous vous remercions d\'avoir choisi sfjam-noris pour vos achats.\n';
            txt += 'Si vous avez des questions, rendez vous sur ' + config.site.host + ' rubrique contact.';

        if (err) {
            sendNorisMail(universalSender, to.Mail, "SFJAM Noris Confirmation de commande", txt, null, callback);
        }else{
            var mail = data.toString();
            mail = mail.replace('[identite]', to.Prenom + ' ' + to.Nom);
            mail = mail.replace('[CommNumm]', facture.comNum);
            mail = mail.replace('[shipping]', facture.delivery);
            mail = mail.replace('[billing]', formatBillingAddress(to));
            mail = mail.replace('[port_total]', facture.port + ' &euro;');
            mail = mail.replace('[prixTTC_total]', facture.amount + ' &euro;');

            var l = facture.caddie.articles.length;
            var line = '';
            for(var i = 0; i < l; i++){
                line += '<tr>';
                line += '<td align=middle>' + facture.caddie.articles[i].item.category + '</td>';
                line += '<td align=middle>' + facture.caddie.articles[i].item.ref + '</td>';
                line += '<td align=middle>' + facture.caddie.articles[i].item.nom + '</td>';
                line += '<td align=middle>' + facture.caddie.articles[i].item.couleur + ' - ' + facture.caddie.articles[i].item.taille + '</td>';
                line += '<td align=\"right\">' + facture.caddie.articles[i].item.prix_ht + ' &euro; </td>';
                line += '<td align=middle>' + facture.caddie.articles[i].item.quantity + '</td>';
                line += '<td align=\"right\">' + (facture.caddie.articles[i].item.prix_ht * facture.caddie.articles[i].item.quantity) + ' &euro; </td>';
                line += '</tr>';
            }
            var price = (facture.amount - (facture.tax + facture.port));
            mail = mail.replace('[caddie]', line);
            mail = mail.replace('[prixHT_total]', price + ' &euro;');
            mail = mail.replace('[tva_total]', facture.tax + ' &euro;');
            sendNorisMail(universalSender, to.Mail, "SFJAM Noris Confirmation de commande", txt, mail, callback);
        }
    });
};
exports.sendConfirmNoris = function(to, facture, callback){
    fs.readFile('mailing/templates/merchantValidComm.html', 'utf8', function (err,data) {
        
         var subject = 'Confirmation commande(' + facture.comNum + ') de ' + to.Prenom + ' ' + to.Nom + ' (' + to.Mail + ')';
         var txt = 'Bonjour,\n';
            txt += 'Votre client ' + to.Prenom + ' ' + to.Nom + ' a effectué et payé la commande numéro ' + facture.comNum + ' sur ' + config.site.host + '.\n';
            txt += 'Cette commande passée le ' + formatDateForBilling(new Date(facture.date)) + ' concerne ' + facture.caddie.articles.length + ' article(s) pour une valeur totale de ' + facture.amount + ' €.\n';
            txt += 'Vous pouvez retrouver le détail de cette commande en vous connectant sur ' + config.site.host + '/admin .\n';
            txt += 'Nous vous conseillons de vous rendre sur ' + config.site.host + '/admin dès cette commande traité pour actualiser son état à "En livraison" puis "Fermé"';

        if (err) {
            sendNorisMail(universalSender, norisCommande, subject, txt, null, callback);
        }else{
            var mail = data.toString();
            mail = mail.replace('[identite]', to.Prenom + ' ' + to.Nom);
            mail = mail.replace('[commDate]', formatDateForBilling(new Date(facture.date)));
            mail = mail.replace('[CommNumm]', facture.comNum);
            mail = mail.replace('[shipping]', facture.delivery);
            mail = mail.replace('[billing]', formatBillingAddress(to));
            mail = mail.replace('[port_total]', facture.port + ' &euro;');
            mail = mail.replace('[prixTTC_total]', facture.amount + ' &euro;');

            var l = facture.caddie.articles.length;
            var line = '';
            for(var i = 0; i < l; i++){
                line += '<tr>';
                line += '<td align=middle>' + facture.caddie.articles[i].item.category + '</td>';
                line += '<td align=middle>' + facture.caddie.articles[i].item.ref + '</td>';
                line += '<td align=middle>' + facture.caddie.articles[i].item.nom + '</td>';
                line += '<td align=middle>' + facture.caddie.articles[i].item.couleur + ' - ' + facture.caddie.articles[i].item.taille + '</td>';
                line += '<td align=\"right\">' + facture.caddie.articles[i].item.prix_ht + ' &euro; </td>';
                line += '<td align=middle>' + facture.caddie.articles[i].item.quantity + '</td>';
                line += '<td align=\"right\">' + (facture.caddie.articles[i].item.prix_ht * facture.caddie.articles[i].item.quantity) + ' &euro; </td>';
                line += '</tr>';
            }
            var price = (facture.amount - (facture.tax + facture.port));
            mail = mail.replace('[caddie]', line);
            mail = mail.replace('[prixHT_total]', price + ' &euro;');
            mail = mail.replace('[tva_total]', facture.tax + ' &euro;');
            sendNorisMail(universalSender, norisCommande, subject, txt, mail, callback);
        }
    });
    
};
exports.sendConfirmUserMail = function(identification, adr, callback){
    fs.readFile('mailing/templates/confirmUser.html', 'utf8', function (err,data) {
        
        var url = config.site.host + '/#/Confirmation/' + identification;

        var txt = 'Bonjour,\n';
        txt += 'SFJAM-Noris vous remercie d\'avoir pris le temps de créer un compte sur son site.\n';
        txt += 'Pour finir le processus de création de votre compte nous vous demandons de cliquer sur ce lien ' + url + '\n'; 
        txt += 'ou bien de copier l\'adresse dans la barre d\'adresse de votre navigateur.\n';

        txt += 'Après avoir confirmé votre inscription vous pourrez vous identifiez et continuer le processus d\'achat.\n';

        txt += 'Cordialement,\n';
        txt += 'L\'équipe de SFJAM-Noris.';

        if (err) {
            sendNorisMail(universalSender, adr, 'SFJAM Noris Confirmation d\'adresse E-mail valide', txt, null, callback);
        }else{
            var mail = data.toString();
            mail = mail.replace('[urlConfirm]', url);

            sendNorisMail(universalSender, adr, 'SFJAM Noris Confirmation d\'adresse E-mail valide', txt, mail, callback);
        }
    });
};

exports.sendForgottenPassword = function(pass, adr, callback){
    fs.readFile('mailing/templates/newConnexion.html', 'utf8', function (err,data) {

        var txt = 'Bonjour,\n';
        txt += 'Une demande de nouveaux identifiants de connexion pour le site SFJAM-Noris a été demandé.\n';
        txt += 'Si vous n\'ètes pas l\'auteur de cette demande veuillez contacter SFJAM-Noris en vous rendant à l\'adresse ' + config.site.host + ' rubrique contact.\n';
        txt += 'Vos nouveaux identifiant de connexions sont :\n';
        txt += 'Identifiant : ' + adr + '\n';
        txt += 'Mot de Passe : ' + pass + '\n';
        txt += 'Cordialement,\n';
        txt += 'L\'équipe de SFJAM-Noris.';

        if (err) {
            console.log('sendForgottenPassword has error :' + err);
            sendNorisMail(universalSender, adr, 'SFJAM Noris identifiant', txt, null, callback);
        }else{
            var mail = data.toString();
            mail = mail.replace('[login]', adr);
            mail = mail.replace('[newPass]', pass);

            sendNorisMail(universalSender, adr, 'SFJAM Noris identifiant', txt, mail, callback);
        }
    });
};

exports.sendLogErrorDEV = function(err, req){
    var txt = 'Bonjour,\n';
        txt += 'Une erreur est apparu dans l\'application SFJAM-Noris le ' + formatDateForBilling(new Date()) + '\n';
        txt += 'Information de la requête : ' + req.method + ' :: ' + req.url + '\n';
        txt += 'Nom de l\'erreur : ' + err.message + '.\n';
        txt += 'Stack :' + err.stack + '\n';
        txt += 'Cordialement,\n';
        txt += 'L\'équipe de SFJAM-Noris.';
    console.log(txt);
};
exports.sendLogError = function(err, req, callback){
    var txt = 'Bonjour,\n';
        txt += 'Une erreur est apparu dans l\'application SFJAM-Noris le ' + formatDateForBilling(new Date()) + '\n';
        if (req != null){
            txt += 'Information de la requête : ' + req.method + ' :: ' + req.url + '\n';
        }
        txt += 'Nom de l\'erreur : ' + err.message + '.\n';
        txt += 'Stack :' + err.stack + '\n';
        txt += 'Cordialement,\n';
        txt += 'L\'équipe de SFJAM-Noris.';

    sendNorisMail(universalSender, 'mathieu.brick@gmail.com, contact@numericgraphics.com', 'SFJAM Noris : Erreur from ' + config.site.name, txt, null, callback);
};


exports.sendLogMessage = function(msg, callback){
    var txt = 'Bonjour,\n';
        txt += 'L\'application SFJAM-Noris vous envoie le message suivant le ' + formatDateForBilling(new Date()) + '\n';
        txt += msg + '\n';
        txt += 'Cordialement,\n';
        txt += 'L\'équipe de SFJAM-Noris.';

    sendNorisMail(universalSender, 'mathieu.brick@gmail.com, contact@numericgraphics.com', 'SFJAM Noris : Message from ' + config.site.name, txt, null, callback);
};

var formatBillingAddress = function(u){
    var retour = u.Nom + ' ' + u.Prenom + '<br />';
    retour += u.Adresse + '<br />';
    retour += u.Ville + ' ' + u.CP + '<br />';
    retour += u.Pays + '<br />';

    return retour;
};
var formatDateForBilling = function(d){
    var retour = digits(d.getDate()) + '/';
    retour += digits(d.getMonth() + 1) + '/';
    retour += d.getFullYear().toString();
    retour += ' - ';
    retour += digits(d.getHours()) + 'H';
    retour += digits(d.getMinutes()) + 'm';
    retour += digits(d.getSeconds()) + 's';

    return retour;
};
var digits = function(x){
    if(x < 10){
        return '0' + x.toString();
    }else{
        return x.toString();
    }
};