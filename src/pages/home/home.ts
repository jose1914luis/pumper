import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Http } from '@angular/http';
import { Headers } from '@angular/http';
import jsSHA from 'jssha';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { ViewChild } from '@angular/core';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

	message = '';
	txtCoin = '';
	
	takprice = 'l';
	txtamount = 0.0005;
	txtmbuy = 1;
	txtmsell = 1.1;

	apikey = '';
	apisign = '';

	private Last: number = 0;
	buyuuid = 0;
	selluuid = 0;
	tmpava = 0;	
	ITERATION = 15;
	TIME = 350;
	count = 0;
	count2 = 0;	
	
	ch_buy = 'true';
  	ch_sell = 'true';
  	ch_osell = 'false';
  	sl_price = 'l';
  	txt_nm = 1;

  	run = false;
  	proxy = 'https://bittrex.com/api';  	
  	moneda = '';

  	@ViewChild('content') content:any;

  	constructor(public http: Http, public navCtrl: NavController, public platform: Platform) {	   
  		

  		if(!this.platform.is('android')){
  			this.proxy = '/api';
  		}  	
  	}

  	init_values(){  		
  		 //Inicializo los valores q habian sido guardados 
		this.apikey = this.get_values('txt_key', "API Key is no set. The App will not run<br>", '0');
		//console.log('   > ' +this.apikey);
		if(this.apikey == '0' || this.apikey.length < 10){
			return;
		}
		this.apisign = this.get_values('txt_secret', "API Secret is no set. The App will not run<br>", '0');		
		
		if(this.apisign == '0' || this.apisign.length < 10){
			return;
		}
		this.run = true;
		this.txtmbuy = Number(this.get_values('txtmbuy', "Default Buy Multiplier set = "+this.txtmbuy+"<br>", this.txtmbuy));
		this.txtamount = Number(this.get_values('txtamount', "Default Amount BTC set = "+this.txtamount+"<br>",this.txtamount));
		this.txtmsell = Number(this.get_values('txtmsell', "Default Sell Multiplier set = "+this.txtmsell+"<br>", this.txtmsell));

		this.ch_buy = this.get_values('ch_buy', "Default Cancel buy order set = "+this.ch_buy+"<br>", this.ch_buy);

	    this.ch_sell = this.get_values('ch_sell', "Default Cancel sell order set = "+this.ch_sell+"<br>", this.ch_sell);
	    this.ch_osell = this.get_values('ch_osell', "Default Sell over loss set = "+this.ch_osell+"<br>", this.ch_osell);

	    this.sl_price = this.get_values('sl_price', "Default Take Price set = Last<br>",this.sl_price);
	    this.txt_nm = Number(this.get_values('txt_nm', "Default Negative Sell Multiplier set = "+this.txt_nm+"<br>",this.txt_nm));


		this.ITERATION = Number(this.get_values('txt_ite', "Default Iteration set = 15<br>",this.ITERATION));
		this.TIME = Number(this.get_values('txt_time', "Default Time set = 350ms<br>", this.TIME));

  	}

  	clear_console(){

  		this.message = "";
  	}

  	save_data(e, message){

    	this.message = ">"+message +'<br>';    
	    localStorage.setItem(e.target.name, e.target.value); 
	}

	ionViewWillEnter (){
		this.message = "";
		this.init_values();
	};

  	get_values(item, message, defa){
  		var value = localStorage.getItem(item);

  		if (value === null || value.length < 1) {
  			this.message += ">"+message;
  			if(typeof defa !== 'undefined'){
  				return defa;
  			}
		}
		return value;
  	}

  	ejecutarPump(e){

		this.count = 0;
		this.count2 = 0;	
		this.moneda = this.txtCoin;
		this.content.scrollToBottom(300);
		if(this.run && this.txtCoin.length > 1){
			this.txtCoin = '';
		 	this.check(1);
		}
	}

	get_header_confi(params, url, key){

		//append time
	    var time = Math.floor(new Date().getTime() / 1000);
	    params['nonce'] = time;
	    params['apikey'] = this.apikey;
	    
		url = 'https://bittrex.com/api' + url + '?';
		var ban = true;
		for (var k in params){
	        var attrName = k;
	        var attrValue = params[k];
	        url += (ban)?'':'&';
	        ban = false;
	        url += (attrName+'='+attrValue);
	    }	  

		var headers = new Headers();
		var shaObj = new jsSHA("SHA-512", "TEXT");
		shaObj.setHMACKey(key, "TEXT");																						
		shaObj.update(url);
		var hmac = shaObj.getHMAC("HEX");
		headers.append('apisign', hmac);

		return {params: params, headers: headers};
	}

	check(make){
	 	

		switch(make){	

			case 1:

        		this.message = ">Init... coin target: " + this.moneda + '<br>';
				var config = {
				    params: {
				        market: "BTC-"+ this.moneda
				    }
				};
				var url = '/v1.1/public/getticker';
				//optener el tiket de la moneda saber a como esta y poder poner la orden de compra
				this.http.get(this.proxy+url, config).map(res => res.json()).subscribe(
					data => {
			        					
						this.message += ">Getting coin information:<br>";
						
						this.Last = parseFloat((this.sl_price == 'l')?data.result.Last:(this.sl_price == 'a')?data.result.Ask:(this.sl_price == 'b')?data.result.Bid:0);
						
						
						this.Last = parseFloat(data.result.Last);
						let ask:number = parseFloat(data.result.Ask);
						var bid = parseFloat(data.result.Bid);
						this.message += ">Prices:  Last: " + this.Last + " Ask: "+ ask + " Bid: "+ bid +"<br>";
						
                        var buyask = (this.txtmbuy * ask).toFixed(8);
                        this.message += ">Buy price: " + buyask + "<br>";
                        
                        var amount = (this.txtamount / parseFloat(buyask)).toFixed(8);                        
                        this.tmpava = Number(amount);
                        this.message += ">Total coins to buy: " + amount + "<br>";
						                       					
						var url = '/v1.1/market/buylimit';
						var params ={
						        market: "BTC-"+this.moneda, 
						        quantity: amount, 
						        rate: buyask
						    };
                        //poner orden de venta
                        this.http.get(this.proxy+url, this.get_header_confi(params, url, this.apisign)).map(res => res.json()).subscribe(
							data => {
					        
								
                                if (data.success == true) {
                                    this.buyuuid = data.result.uuid;
                                    this.message += "--------Buy Order Complete--------" + "<br>";

                                    this.check(2);
                                } else {
                                    this.message += ">Error:" + data.message + "<br>";
                                }				
								
						    },
						    err => {
						         this.message += ">Error:" + err + "<br>";
						    }
			     		);

				    },
				    err => {
				        console.log("Oops!");
				    }
	    		);
				break;

			case 2:

				this.message +=">Checking if buy order was executed." + "<br>";

				var url = '/v1.1/account/getorder';
				                 
			    var params = {
			        uuid: this.buyuuid			        
			    };

				this.http.get(this.proxy+url, this.get_header_confi(params, url, this.apisign)).map(res => res.json()).subscribe(
					data => {
			        	
                        if (data.success && !data.result.IsOpen) {
                            this.message += "--------Buy Order Executed!!!!--------" + "<br>";
                            /*Sell Order*/
                            var sell = this.txtmsell;
                            var sellast = this.Last * sell;
                            this.message += ">Sell Price: " + sellast + "<br>";

                            var url = '/v1.1/market/selllimit';
							var params ={
					        	market: "BTC-"+this.moneda,
					        	quantity: this.tmpava, 
					        	rate: sellast
					    	};
					    	console.log(params);
                            this.http.get(this.proxy+url, this.get_header_confi(params, url, this.apisign)).map(res => res.json()).subscribe(
								data => {
						        
                                        if (data.success == true) {
                                            this.message += "--------Sell Order Complete--------" + "<br>";
                                            this.selluuid = data.result.uuid;

                                            this.check(3);
                                        } else {
                                            this.message += ">Error:" + data.message + "<br>";
                                        }	
									
							    },
							    err => {
							         this.message += ">Error:" + err + "<br>";
							    }
				     		);

                        } else {
                        	//this.message += ">Error:" + this.ch_buy + "<br>";
                            //console.log(this.ch_buy);
                            if (this.ch_buy == 'true') {

                                this.count = this.count + 1;
                                if (this.count < this.ITERATION) {

                                    setTimeout(this.check(2), this.TIME);

                                } else {

									var url = '/v1.1/market/cancel';

	                            this.http.get(this.proxy+url, this.get_header_confi({ uuid: this.buyuuid }, url, this.apisign)).map(res => res.json()).subscribe(
									data => {
											if (data.success == true) {
                                                    this.message +=  "--------Buy Order Canceled!!!!--------" + "<br>";
                                                    //check if sell order was execute. 

                                                } else {
                                                    this.message += ">Error:" + data.message + "<br>";
                                                }
										
								    },
								    err => {
								         this.message += ">Error:" + err + "<br>";
								    }
					     		)

                                    
                                }
                            } else {

                                 this.message += ">Check buy order is disabled." + "<br>";
                            }
                        }

				    },
				    err => {
				         this.message += ">Error:" + err + "<br>";
				    }
	    		);              
				break;					                           

			case 3:

				this.message += ">Checking if sell order was execute." + "<br>";
				var url = '/v1.1/account/getorder';
				
                this.http.get(this.proxy+url, this.get_header_confi({uuid: this.selluuid}, url, this.apisign)).map(res => res.json()).subscribe(
					data => {

				        if (data.success && data.result.IsOpen) {
                        	this.count2 = this.count2 + 1;

                            if (this.ch_sell == 'true') {

                                if (this.count2 > this.ITERATION) {
                                    //cancel order and sell new order to the same price or lest

                                    var url = '/v1.1/market/cancel';			
									var params = {

							        	uuid: this.selluuid
							    	};

		                            this.http.get(this.proxy+url, this.get_header_confi(params, url, this.apisign)).map(res => res.json()).subscribe(
										data => {
								        
	                                       if (data.success == true) {
                                                this.message += "--------Sell Order Canceled!!!!--------" + "<br>";

                                                if (this.ch_sell == 'true') {

													var sellastopt = this.Last * this.txt_nm;
	                                                this.message += ">Sell Order to: " + sellastopt + " - " + this.tmpava + "<br>";
	                                                var url = '/v1.1/market/selllimit';
													var params ={
											        	market: "BTC-"+this.moneda, 
											        	quantity: this.tmpava, 
											        	rate: sellastopt
											    	};

						                            this.http.get(this.proxy+url, this.get_header_confi(params, url, this.apisign)).map(res => res.json()).subscribe(
														data => {

	                                                            if (data.success == true) {
	                                                                this.message += "--------Sorry. Sell Order Lossing (" + sellastopt + ") Complete!!!!--------" + "<br>";
	//
	                                                            } else {
	                                                                this.message += ">Error:" + data.message + "<br>";
	                                                            }
															
													    },
													    err => {
													         this.message += ">Error:" + err + "<br>";
													    }
										     		);

	                                            }
	                                        }
											
									    },
									    err => {
									         this.message += ">Error:" + err + "<br>";
									    }
						     		);

                                } else {
                                    setTimeout(this.check(3), this.TIME);
                                }
                           } else {

                               this.message += ">Check sell order is disabled." + "<br>";
                            }
                        } else {

                            this.message += ">PUMP was completed... Congratulation!!<br>";
                            this.message += ">DONATIONS BTC: 1MvMWMiJFoGvQPHpRUGwDS4BReuMHYm6bu<br>";
                            this.message += ">Copy from about it. In the las section<br>";
                        }                        
						
				    },
				    err => {
				         this.message += ">Error:" + err + "<br>";
				    }
	     		);

				break;
			case 4:
				console.log('END');
				break;
		}

	}


}
