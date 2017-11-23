require('styles/vender/bootstrap.min.css');
require('styles/vender/font-awesome.min.css');
require('styles/vender/Raleway.css');
require('styles/App.css');
require('es6-promise').polyfill();
require('isomorphic-fetch');
import Autosuggest from 'react-autosuggest';
import { ToastContainer } from 'react-toastr';

import React from 'react'

var selectedEmail = "";

// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSuggestions(value, users) {
  const escapedValue = escapeRegexCharacters(value.trim());
  
  if (escapedValue === '') {
    return [];
  }

  const regex = new RegExp('^' + escapedValue, 'i');

  return users.filter(user =>
    {
    return regex.test(user.email) || regex.test(user.name);
    });
}

function getSuggestionValue(suggestion) {
  selectedEmail = suggestion.email;
  return suggestion.name;
}

function renderSuggestion(suggestion) {
  return (
    <div>
      <span>{suggestion.name}</span>
      <br />
      <span>{suggestion.email}</span>
    </div>
  );
}

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      cwnNumber: -1,
      users: [],
      value: '',
      suggestions: []
    }
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };
  
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value, this.state.users)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  handleClick = () => {
    if (this.state.value != null && this.state.value.length > 0 && selectedEmail != null && selectedEmail.length > 0)
      {
        var json = JSON.stringify({
          email: selectedEmail,
          event: this.state.cwnNumber
        });
        fetch('/api/checkin', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: json
        }).then((response) => {
          response.json().then(json => {
            if (response.ok)
            {
              this.container.success('Thank you for Checking in', {
                closeButton: true
              });
            }
            else
            {
              this.container.error(json.error, 'Unsuccessful Checkin', {
                closeButton: true
              });
            }
          });
        }).catch(() => {
        });
      }
  }

  componentWillMount() {
    var that = this;
      fetch('/api/data')
      .then((resp) => {
          return resp.json();
      }).then((json) => {
        that.setState({ cwnNumber: json.cwnNumber, users: json.users, loading: false });
      }).catch(() => {
        that.setState({ cwnNumber: -1, users: [], loading: true });
      });
  }

  render() {
    if (this.state.loading)
      return (<div></div>);

    const value = this.state.value;
    const suggestions = this.state.suggestions;
    const inputProps = {
      placeholder: 'Enter your Name or Email',
      value,
      onChange: this.onChange
    };
  
    return (
      <div className="checkin-background">
        <ToastContainer
          ref={ref => this.container = ref}
          className="toast-top-right"
        />
        <div>
          <h1 className="cwn-logo"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/69546/cwn-logo-light-fullnowatermark.svg" alt="CoWorking Night - Learn. Connect. Collaborate." /></h1>
          <h2 className="cwn-info"><span className="cwn-edition">CoWorking Night #<span className="cwn-edition-number">{this.state.cwnNumber}</span></span><span className="cwn-date-time"><span className="cwn-time">6‑10pm</span></span><span className="cwn-location">Huntsville West</span></h2>
        </div>
        <br /><br />
        <h2 className="cwn-info">Please Sign In</h2>
        <div className="input-group">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps} />
          <button type="button" className="btn" onClick={this.handleClick}>Sign In</button>
        </div>
        <footer className="footer fixed-bottom text-center">
          <div className="container">
            <p className="schedule-url">
              <a href="https://coworkingnight.org/schedule">coworkingnight.org/schedule</a>
            </p>
            <p className="cwn-sponsors">
              Sponsored by <a href="#" target="_blank">Huntsville West</a> and <a href="#" target="_blank">Hackster.io</a>. Presented by <a href="#" target="_blank">Urban Engine</a>.
            </p>
          </div>
        </footer>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
