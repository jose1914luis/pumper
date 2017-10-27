import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the BittrexServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class BittrexServiceProvider {


  constructor(public http: Http) {
    console.log('Hello BittrexServiceProvider Provider');
  }

public data;
load() {
  if (this.data) {
    // already loaded data
    return Promise.resolve(this.data);
  }

  var nonce = new Date();
  // don't have the data yet
  return new Promise(resolve => {
    // We're using Angular HTTP provider to request the data,
    // then on the response, it'll map the JSON data to a parsed JS object.
    // Next, we process the data and resolve the promise with the new data.
    this.http.get('https://bittrex.com/api/v1.1/market/getopenorders?apikey=e1ab364665754b3bb2a536e0f82d4383'+'&nonce=' + nonce.getTime() + '&apisign=2b3edf787fc94dd3b26bf9a2ebcdb400')
      .map(res => res.json())
      .subscribe(data => {
        // we've got back the raw data, now generate the core schedule data
        // and save the data for later reference
        this.data = data;
        resolve(this.data);
      });
  });
}
}
