require('styles/vender/bootstrap.min.css');
require('styles/vender/font-awesome.min.css');
require('styles/vender/Raleway.css');
require('styles/App.css');
require('es6-promise').polyfill();
require('isomorphic-fetch');
import Autosuggest from 'react-autosuggest';
import { ToastContainer } from 'react-toastr';

import React from 'react'

var selectedSuggestionEmail = '';

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
  selectedSuggestionEmail = suggestion.email;
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

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email.toLowerCase());
}

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      cwnNumber: -1,
      users: [],
      value: '',
      suggestions: [],
      shouldCreateUserAndCheckin: false
    }
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  emailIsASuggestion = (email) => {
    var i;
    for (i = 0; i < this.state.suggestions.length; i++) {
        if (this.state.suggestions[i].email === email) {
            return true;
        }
    }
    return false;
  }
  
  onSuggestionsFetchRequested = ({ value }) => {
      console.log(value);
      if (value.length < 3)
        this.setState({
          suggestions: []
        });
      else
        this.setState({
          suggestions: getSuggestions(value, this.state.users)
        });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  clearInputs() {
    this.state.value = '';
    if (this.refs.autosuggest && this.refs.autosuggest.input) this.refs.autosuggest.input.value = '';
    selectedSuggestionEmail = '';
    if (this.refs.create_email) this.refs.create_email.value = '';
    if (this.refs.create_first_name) this.refs.create_first_name.value = '';
    if (this.refs.create_last_name) this.refs.create_last_name.value = '';
  }

  checkinWithOpenHsvAccount = (emailInput) => {
    var json = JSON.stringify({
      email: emailInput,
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
        if (response.ok && response.status == 201)
        {
          this.container.success('Thank you for Checking in', 'Wecome to CoWorking Night', {
            closeButton: true
          });
        }
        else
        {
          this.container.error(json.error, 'Unsuccessful Checkin', {
            closeButton: true
          });
        }
        this.clearInputs();
      });
    }).catch(() => {
    });
  }

  createOpenHsvAccountAndCheckin = (emailInput, firstNameInput, lastNameInput) => {
    var json = JSON.stringify({
      email: emailInput,
      first_name: firstNameInput,
      last_name: lastNameInput,
      event: this.state.cwnNumber
    });
    fetch('/api/createAndCheckin', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: json
    }).then((response) => {
      response.json().then(json => {
        if (response.ok && response.status == 201)
        {
          this.container.success('Thank you for Checking In, please refer to your email to setup your OpenHuntsville account', 'Wecome to CoWorking Night', {
            closeButton: true
          });
        }
        else
        {
          this.container.error(json.error, 'Unsuccessful Checkin', {
            closeButton: true
          });
        }
        this.clearInputs();
      });
    }).catch(() => {
    });
  }

  handleClick = () => {
    if (this.state.value != null && this.state.value.length > 0)
      {
        if (selectedSuggestionEmail != null && selectedSuggestionEmail.length > 0) {
          console.log ("checking in with hsv acct");
          this.checkinWithOpenHsvAccount(selectedSuggestionEmail);
        } else if (this.state.shouldCreateUserAndCheckin) {
          console.log("lets create an account")
          const email = this.refs.create_email.value;
          const firstName = this.refs.create_first_name.value;
          const lastName = this.refs.create_last_name.value;
          this.clearInputs();
          this.setState({shouldCreateUserAndCheckin: false});
          this.createOpenHsvAccountAndCheckin(email, firstName, lastName);
        } else {
          console.log ("validating email");
          if (validateEmail(this.state.value)) {
            console.log ("checking if email is a suggestion");
            // make sure user hasn't typed in open huntsville email
            if (this.emailIsASuggestion(this.state.value)) {
              console.log ("checking in with hsv acct");
              this.checkinWithOpenHsvAccount(this.state.value);
            } else {
              console.log ("lets create an account");
              // show first name / last name boxes, and create new user
              this.setState({shouldCreateUserAndCheckin: true});
            }
          } else {
            console.log ("invalid email");
            // invalid email. Ask user to enter email through toastr
            this.clearInputs();
            this.container.error('Please enter a valid email to Check In', 'Invalid Email', {
              closeButton: true
            });
          }
        }
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
      placeholder: 'Enter your email address',
      value,
      onChange: this.onChange
    };
    const titleText = this.state.shouldCreateUserAndCheckin ? "Almost Done..." : "Please Check In";
    const checkinText = this.state.shouldCreateUserAndCheckin ? "Complete Check-In" : "Check In";

    const inputGroup = this.state.shouldCreateUserAndCheckin ? 
      <div>
        <p className="vw30">Please provide your name to complete check-in. You won't be asked for this next time.</p>
        <div className="input-group display-block">
          <div className="pad"><input className="create-account-input display-block" type="text" value={this.state.value} ref="create_email" disabled /></div>
          <div className="pad"><input className="create-account-input display-block" type="text" placeholder="First Name" ref="create_first_name" /> </div>
          <div className="pad"><input className="create-account-input display-block" type="text" placeholder="Last Name" ref="create_last_name" /> </div>
          <div className="pad"><button type="button" className="btn display-block" onClick={this.handleClick}>{checkinText}</button></div>
        </div>
      </div>
        :
        <div className="input-group">
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            ref="autosuggest"/>
          <button type="button" className="btn" onClick={this.handleClick}>{checkinText}</button>
        </div>;
    
    return (
      <div className="checkin-background">
        <ToastContainer
          ref={ref => this.container = ref}
          className="toast-top-right"
        />
        <div>
          <h1 className="cwn-logo"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/69546/cwn-logo-light-fullnowatermark.svg" alt="CoWorking Night - Learn. Connect. Collaborate." /></h1>
        </div>
        <br /><br />
        <h2 className="cwn-info">{titleText}</h2>
        {inputGroup}
        <footer className="footer fixed-bottom text-center">
          <div className="container">
            <p className="schedule-url">
              <a href="https://coworkingnight.org/schedule">coworkingnight.org/schedule</a>
            </p>
            <p className="cwn-sponsors">
              Powered by <a href="#" target="_blank"><img className="openhsv-logo" src={require('../imgs/openhsv-logo.png')} alt="OpenHSV logo" /></a>. Presented by <a href="#" target="_blank">Urban Engine</a>.
            </p>
          </div>
        </footer>
      </div>
      );
    }
  }

AppComponent.defaultProps = { };

export default AppComponent;
