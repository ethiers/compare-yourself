import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs';
import {Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {CompareData} from './compare-data.model';
import {AuthService} from '../user/auth.service';

@Injectable()
export class CompareService {
  dataEdited = new BehaviorSubject<boolean>(false);
  dataIsLoading = new BehaviorSubject<boolean>(false);
  dataLoaded = new Subject<CompareData[]>();
  dataLoadFailed = new Subject<boolean>();
  userData: CompareData;

  constructor(private http: HttpClient,
              private authService: AuthService) {
  }

  onStoreData(data: CompareData) {
    this.dataLoadFailed.next(false);
    this.dataIsLoading.next(true);
    this.dataEdited.next(false);
    this.userData = data;

    this.authService.getAuthenticatedUser().getSession((err, session) => {
      if (err) {
        return;
      }

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': session.getIdToken().getJwtToken()
        })
      };

      this.http.post('https://API_ID.execute-api.ca-central-1.amazonaws.com/dev/compare-yourself', data, httpOptions)
        .subscribe(
          (result) => {
            this.dataLoadFailed.next(false);
            this.dataIsLoading.next(false);
            this.dataEdited.next(true);
          },
          (error) => {
            this.dataIsLoading.next(false);
            this.dataLoadFailed.next(true);
            this.dataEdited.next(false);
          }
        );

    });
  }

  onRetrieveData(all = true) {
    this.dataLoaded.next(null);
    this.dataLoadFailed.next(false);
    const queryParam = '';
    let urlParam = 'all';
    if (!all) {
      urlParam = 'single';
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'XX'
      })
    };

    this.http.get<CompareData[]>('https://API_ID.execute-api.REGION.amazonaws.com/dev/' + urlParam + queryParam, httpOptions)
      .pipe(map(
        (response: CompareData[]) => response // this line is not really needed
      ))
      .subscribe(
        (data) => {
          if (all) {
            this.dataLoaded.next(data);
          } else {
            console.log(data);
            if (!data) {
              this.dataLoadFailed.next(true);
              return;
            }
            this.userData = data[0];
            this.dataEdited.next(true);
          }
        },
        (error) => {
          this.dataLoadFailed.next(true);
          this.dataLoaded.next(null);
        }
      );
  }

  onDeleteData() {
    this.dataLoadFailed.next(false);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'XX'
      })
    };

    this.http.delete('https://API_ID.execute-api.REGION.amazonaws.com/dev/', httpOptions)
      .subscribe(
        (data) => {
          console.log(data);
        },
        (error) => this.dataLoadFailed.next(true)
      );
  }
}
