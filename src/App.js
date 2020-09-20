import React from 'react';
import './App.css';
import config from './config';
import {GoogleTTS} from './speech'

export default class App extends React.Component {

  handleClick = () => {
    // window.TTS
    // .speak('Apache cordova is a mobile application development').then(function () {
    //     alert('success');
    // }, function (reason) {
    //     alert(reason);
    // });
    // window.TTS
    // .speak({
    //     text: 'Hôm nay là chủ nhật',
    //     locale: 'vi',
    //     rate: 1.5
    // }).then(function () {
    //     alert('success');
    // }, function (reason) {
    //     alert(reason);
    // });
    const { voice, speed, pitch, range } = config.speechSynthesis['vi-VN']["character"]["male"];
    let speechSynthesis = {};
    speechSynthesis = new GoogleTTS("vi-VN", voice, speed, pitch, range);
    speechSynthesis.start('con chó con con chó mẹ', 100)
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Ma Sói One Night</h1>
          <a className="App-Play" href="#" onClick={this.handleClick}>
            Play
          </a>
        </header>
      </div>
    );
  }
}
