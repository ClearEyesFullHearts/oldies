var exec = require('child_process').execFile;

exports.callRequest = function(params, callback){

    if((params.cgi_bin_path == undefined) ||
        (params.merchant_id == undefined) ||
        (params.amount == undefined) ||
        (params.customer_id == undefined) ||
        (params.customer_email == undefined) ||
        (params.pathfile == undefined)){
            callback({ success:false, msg:'Parameters not found' });
            return;
    }
    var path_bin = params.cgi_bin_path + 'request';

    var arrP = [];
    arrP.push('pathfile=' + params.pathfile);
    arrP.push('merchant_id=' + params.merchant_id);
    arrP.push('amount=' + params.amount);
    arrP.push('customer_id=' + params.customer_id);
    arrP.push('customer_email=' + params.customer_email);
    
    if(params.transaction_id != undefined){
        arrP.push('transaction_id=' + params.transaction_id);
    }
    if(params.merchant_country != undefined){
        arrP.push('merchant_country=' + params.merchant_country);
    }
    if(params.currency_code != undefined){
        arrP.push('currency_code=' + params.currency_code);
    }
    if(params.normal_return_url != undefined){
        arrP.push('normal_return_url=' + params.normal_return_url);
    }
    if(params.cancel_return_url != undefined){
        arrP.push('cancel_return_url=' + params.cancel_return_url);
    }
    if(params.automatic_response_url != undefined){
        arrP.push('automatic_response_url=' + params.automatic_response_url);
    }
    if(params.customer_ip_address != undefined){
        arrP.push('customer_ip_address=' + params.customer_ip_address);
    }
    if(params.language != undefined){
        arrP.push('language=' + params.language);
    }
    if(params.payment_means != undefined){
        arrP.push('payment_means=' + params.payment_means);
    }
    if(params.header_flag != undefined){
        arrP.push('header_flag=' + params.header_flag);
    }
    if(params.capture_day != undefined){
        arrP.push('capture_day=' + params.capture_day);
    }
    if(params.capture_mode != undefined){
        arrP.push('capture_mode=' + params.capture_mode);
    }
    if(params.bgcolor != undefined){
        arrP.push('bgcolor=' + params.bgcolor);
    }
    if(params.block_align != undefined){
        arrP.push('block_align=' + params.block_align);
    }
    if(params.block_order != undefined){
        arrP.push('block_order=' + params.block_order);
    }
    if(params.textcolor != undefined){
        arrP.push('textcolor=' + params.textcolor);
    }
    if(params.receipt_complement != undefined){
        arrP.push('receipt_complement=' + params.receipt_complement);
    }
    if(params.caddie != undefined){
        arrP.push('caddie=' + params.caddie);
    }
    if(params.data != undefined){
        arrP.push('data=' + params.data);
    }
    if(params.return_context != undefined){
        arrP.push('return_context=' + params.return_context);
    }
    if(params.target != undefined){
        arrP.push('target=' + params.target);
    }
    if(params.order_id != undefined){
        arrP.push('order_id=' + params.order_id);
    }
    if(params.normal_return_logo != undefined){
        arrP.push('normal_return_logo=' + params.normal_return_logo);
    }
    if(params.cancel_return_logo != undefined){
        arrP.push('cancel_return_logo=' + params.cancel_return_logo);
    }
    if(params.submit_logo != undefined){
        arrP.push('submit_logo=' + params.submit_logo);
    }
    if(params.logo_id != undefined){
        arrP.push('logo_id=' + params.logo_id);
    }
    if(params.logo_id2 != undefined){
        arrP.push('logo_id2=' + params.logo_id2);
    }
    if(params.advert != undefined){
        arrP.push('advert=' + params.advert);
    }
    if(params.background_id != undefined){
        arrP.push('background_id=' + params.background_id);
    }
    if(params.templatefile != undefined){
        arrP.push('templatefile=' + params.templatefile);
    }
    
    exec(path_bin, arrP, function(error, stdout, stderr){
        //	sortie de la fonction : $result=!code!error!buffer!
        //	    - code=0	: la fonction génère une page html contenue dans la variable buffer
        //	    - code=-1 	: La fonction retourne un message d'erreur dans la variable error
        if(error){
            callback({ success:false, msg:stderr.toString()});
        }else{
            var resString = stdout.toString();
            var result = resString.split("!");
            if(result.length > 3){
                result.pop();
                result.shift();
            }
            switch(parseInt(result[0])){
                case 0:
                    callback({ success:true, msg:result[2] });
                    break;
                default:
                    if(result[1] == ''){
                        callback({ success:false, msg:'Result :' + result[0] + ' => Erreur appel request, executable request non trouve ' });
                    }else{
                        callback({ success:false, msg:resString });
                    }
                    break;
            }
        }
        
    });
};

exports.callResponse = function(params, callback){
    if((params.cgi_bin_path == undefined) || (params.data == undefined) || (params.pathfile == undefined)){
            callback({ success:false, msg:'Parameters not found' });
            return;
    }

    var path_bin = params.cgi_bin_path + 'response';

    exec(path_bin, ['message=' + params.data, 'pathfile=' + params.pathfile], function(error, stdout, stderr){

        if(error){
            callback({ success:false, msg:{ code: -1, error: stderr.toString() }});
        }else{
            var ret = stdout.toString();

            var res = ret.split("!");
            res.pop();
            res.shift();

            var response = {
                code: res[0],
                error: res[1],
                merchant_id: res[2],
                merchant_country: res[3],
                amount: res[4],
                transaction_id: res[5],
                payment_means: res[6],
                transmission_date: res[7],
                payment_time: res[8],
                payment_date: res[9],
                response_code: res[10],
                payment_certificate: res[11],
                authorisation_id: res[12],
                currency_code: res[13],
                card_number: res[14],
                cvv_flag: res[15],
                cvv_response_code: res[16],
                bank_response_code: res[17],
                complementary_code: res[18],
                complementary_info: res[19],
                return_context: res[20],
                caddie: res[21],
                receipt_complement: res[22],
                merchant_language: res[23],
                language: res[24],
                customer_id: res[25],
                order_id: res[26],
                customer_email: res[27],
                customer_ip_address: res[28],
                capture_day: res[29],
                capture_mode: res[30],
                data: res[31]
            };
            callback({ success:true, msg:response });
        }
        
    });
};