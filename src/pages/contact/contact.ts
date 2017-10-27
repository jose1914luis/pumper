import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';


@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  constructor(public navCtrl: NavController,private clipboard: Clipboard) {

  }

  copy_address(){

  	this.clipboard.copy('1MvMWMiJFoGvQPHpRUGwDS4BReuMHYm6bu');
  }

}
