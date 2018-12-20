import React, { Component } from 'react'
// import { Link } from 'react-router'
// import { HiddenOnlyAuth, VisibleOnlyAuth } from './util/wrappers.js'

import MarketplaceContract from '../build/contracts/LandContract.json'
import getWeb3 from './util/getWeb3'

// UI Components
// import LoginButtonContainer from './user/ui/loginbutton/LoginButtonContainer'
// import LogoutButtonContainer from './user/ui/logoutbutton/LogoutButtonContainer'

// Styles
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

//
import MainNav from './Components/Navbar';
import Plots from './Components/Plots';
import LoginModal from './Components/LoginModal';
import SignupModal from './Components/SignupModal';
import SellModal from './Components/SellPlotModal';
import Header from './Components/Header';
import Landing from './Components/Landing';
import { connect} from 'react-redux';
import { addProperty, login, logout, signup, buyPlot, sellPlot, takeOffMarket } from "./actions.js"

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      marketplaceInstance: null,
      currentAccount: ''
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })
      console.log('componentWillMount this.state', this.state)
      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const marketplace = contract(MarketplaceContract)
    marketplace.setProvider(this.state.web3.currentProvider)

    this.state.web3.eth.getAccounts((error, accounts) => {
      marketplace.deployed()
        .then((instance) => this.setState({marketplaceInstance: instance, currentAccount: accounts[0]}))
        // .then(() => this.state.marketplaceInstance.getUserType.call({from: accounts[0]}))
        // .then((accountType) => this.setState({ accountType: accountType }))
    })
  }

  render() {
    console.log("this.props", this.props )
    return (
      <div>
         <MainNav 
            onLoginClicked={() => this.setState({showLogin: true})}
            onSignupClicked={() => this.setState({showSignup: true})}
            userId={this.props.userId}
            onLogoutClicked={this.props.logout}
          />

          <div className="container">
            {this.props.userId ? <Header/> : null}
          </div>

          {
            this.props.userId ? null :
            <Landing/>
          }

          {
            this.props.userId && this.props.contractAddressValid ? 
            <Plots plots={this.props.properties} userId={this.props.userId}
                  onBuyClicked={(plotId, price) => this.props.buyPlot(this.props.contractInstance, plotId, price, this.props.userId)}
                  onSellClicked={plotId => this.setState({plotToSell: plotId, showSell: true})}
                  onTakeOffMarketClicked={plotId => this.props.takeOffMarket(this.props.contractInstance, plotId, this.props.userId)}
            /> :null
          }

          <LoginModal 
              showLogin={this.state.showLogin} 
              onClose={() => this.setState({showLogin: false})}
              onLoginClicked={(address, password) => this.props.login(address, password)}
          /> 

          <SignupModal 
              showSignup={this.state.showSignup}
              onClose={() => this.setState({showSignup: false})}
              onsignupClicked={(password) => this.props.signup(password)}
          />   

          <SellModal 
            showSell={this.state.showSell}
            plotNumber={this.state.plotToSell}
            onClose={() => this.setState({showSell: false})}
            onSellClicked={(plotIndex, price) => {
                            this.props.sellPlot(
                                this.props.contractInstance,
                                this.state.plotToSell,
                                price, 
                                this.props.userId
                                                );
                            this.setState({
                                showSell: false
                                          });
                          }}
          />
      </div>
    );
  }
}

let mapStateToProps = (state, props) => {
  return {
      properties: state.properties,
      userId: state.userId,
      contractAddressValid: state.contract ? state.contract.contractAddressValid : false,
      contractInstance: state.contract ? state.contract.contractInstance : null
  } 
}

export default connect(mapStateToProps, {addProperty, login, logout, signup, buyPlot, sellPlot, takeOffMarket})(App);
