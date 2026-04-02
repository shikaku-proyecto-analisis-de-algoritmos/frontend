import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GridComponent } from './components/grid/grid.component';
import { ControlsComponent } from './components/controls/controls.component';
import { VictoryComponent } from './components/victory/victory.component';
import { HttpClientModule } from '@angular/common/http'; // ← agrega este import

@NgModule({
  declarations: [
    AppComponent,
    GridComponent,
    ControlsComponent,
    VictoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
