import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
 

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
  providers: []
})
export class AboutPage {

  txt_key;
  txt_secret;
  txt_time = 350;
  txt_total_time = '';
  txt_nm = 1;
  txt_ite = 15;  
  ch_buy =  'true';
  ch_sell =  'true';
  ch_osell =  'false';
  sl_price = 'l';
  constructor(public navCtrl: NavController) {
  
  }

  init_values(){

       //Inicializo los valores q habian sido guardados 
    this.txt_key = this.get_values('txt_key', 0);
    this.txt_secret = this.get_values('txt_secret', 0);    
   

    this.ch_buy = this.get_values('ch_buy', this.ch_buy);
    this.ch_sell = this.get_values('ch_sell', this.ch_sell)  ;
    this.ch_osell = this.get_values('ch_osell', this.ch_osell) ;
    this.sl_price = this.get_values('sl_price', this.sl_price);
    this.txt_nm = Number(this.get_values('txt_nm', this.txt_nm));


    this.txt_time = Number(this.get_values('txt_time', this.txt_time));
    this.txt_ite = Number(this.get_values('txt_ite', this.txt_ite));


    this.txt_total_time = ((this.txt_time * this.txt_ite) / 1000) + " Seconds";
    
  }   

  ionViewWillEnter (){
    
    this.init_values();
  };

  get_values(item, defa){
      var value = localStorage.getItem(item);

      if (value === null) {
        if(typeof defa !== 'undefined'){
          return defa;
        }
    }
    return value;
  }


  save_data(e, value){
    
    if(typeof value !== 'undefined'){
      localStorage.setItem(e, value);   
    }else{
      localStorage.setItem(e.target.name, e.target.value);  
      if(e.target.name == "txt_time" || e.target.name == "txt_ite"){

        this.txt_total_time = ((this.txt_time * this.txt_ite) / 1000) + " Seconds";
      } 
    }  
  }
}