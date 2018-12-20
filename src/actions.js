import {
    LOGIN_SUCCESSFUL, 
    LOGIN_FAILED, 
    LOGOUT, 
    SIGNUP_SUCCEEDED, 
    SIGNUP_FAILED,
    CHANGE_CONTRACT_ADDRESS, 
    PLOTS_LOADED
} from "./action-types";
import _ from 'lodash';
import Web3 from 'web3';
import abi from '../build/contracts/LandContract.json';


let web3 = new Web3();
web3.setProvider(
    new Web3.providers.WebsocketProvider(
        'ws://localhost:8546'
    )
);
// var Web3=require('web3');
// var web3 = new Web3('ws://10.244.5.43:8546');

// let web3 = new initWeb3();
// const initWeb3 = () => {
//     if (typeof web3 !== 'undefined') {
//     // If a web3 instance is already provided by Meta Mask.
//     App.web3Provider = web3.currentProvider;
//     web3 = new Web3(web3.currentProvider);
//   } else {
//     // Specify default instance if no web3 instance provided
//     App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8547');
//     web3 = new Web3(App.web3Provider);
//   }
// }
export const login = (address, password) => {
    return dispatch => {
        web3.eth.personal.unlockAccount(address, password, 600)
            .then((response) => {
                console.info('Login successful:', response)
                dispatch({ type: LOGIN_SUCCESSFUL, payload: address });
            }).catch(error => {
                console.log('Login Error:', error)
                dispatch({ type: LOGIN_FAILED, payload: null });
            })
    }
}

export const logout = () => {
    return dispatch => dispatch({ type: LOGOUT, payload: null });
}

export const signup = (password) => {
    return dispatch => {
        web3.eth.personal.newAccount(password)
            .then(response => {
                console.info('new account ', response);
                dispatch({ type: SIGNUP_SUCCEEDED, payload: response })
            }).catch(error => {
                console.error('error creating account ', error);
                dispatch({ type: SIGNUP_FAILED })
            })
    }
}

export const changeContractAddress = (newAddress) => {
    return dispatch => {
        if (web3.utils.isAddress(newAddress)) {
            let contractInstance = new web3.eth.Contract(abi, newAddress);
            dispatch({ type: CHANGE_CONTRACT_ADDRESS, payload: { contractAddress: newAddress, contractAddressValid: true, contractInstance: contractInstance } });
            loadPlots(contractInstance, dispatch);
            subscribeToEvents(contractInstance, dispatch);
        } else {
            dispatch({ type: CHANGE_CONTRACT_ADDRESS, payload: { contractAddress: newAddress, contractAddressValid: false, contractInstance: null } });
        }
    }
}

export const clearContractAddress = _ => {
    return dispatch => {
        dispatch({ type: CHANGE_CONTRACT_ADDRESS, payload: { contractAddress: null, contractAddressValid: false, contractInstance: null } })
    }
}

export const buyPlot = (contractInstance, plotId, price, userId) => {
    return dispatch => {
        contractInstance.methods.buyPlot(plotId).send({value: price, from: userId})
        .then(response => {
            console.log(response);
            loadPlots(contractInstance, dispatch);
        })
        .catch(error => {
            console.log(error);
        })
    }
}

export const sellPlot = (contractInstance, plotId, price, userId) => {
    return dispatch => {
        contractInstance.methods.putPlotUpForSale(plotId, price).send({from: userId})
        .then(response => {
            console.log(response);
            loadPlots(contractInstance, dispatch);
        })
        .catch(error => {
            console.log(error);
        })
    }
}

export const takeOffMarket = (contractInstance, plotId, userId) => {
    return dispatch => {
        contractInstance.methods.takeOffMarket(plotId).send({from: userId})
        .then(response => {
            console.log(response);
            loadPlots(contractInstance, dispatch);
        })
        .catch(error => {
            console.log(error);
        })
    }
}

let loadPlots = (contractInstance, dispatch) => {
    contractInstance.methods.getPlots().call()
            .then(response => {
               let plots =  _.zipWith(response[0], response[1], response[2], (owner, forSale, price) => {
                    return {owner, forSale, price};
                })
                dispatch({type: PLOTS_LOADED, payload: plots})
            })
            .catch(error => console.log(error));
}

let subscribeToEvents = (contractInstance, dispatch) => {
    let plotOwnerChangedEvent = contractInstance.events.PlotOwnerChanged(
        {
          fromBlock: 0
        },
        function(error, event) {
          console.log('PlotOwnerChanged event : ', event);
          loadPlots(contractInstance, dispatch);
        }
      );

      let plotPriceChangedEvent = contractInstance.events.PlotPriceChanged(
        {
          fromBlock: 0
        },
        function(error, event) {
          console.log('PlotPriceChanged event : ', event);
          loadPlots(contractInstance, dispatch);
        }
      );

      let plotAvailabilityChangedEvent = contractInstance.events.PlotAvailabilityChanged(
        {
          fromBlock: 0
        },
        function(error, event) {
          console.log('PlotAvailabilityChanged event : ', event);
          loadPlots(contractInstance, dispatch);
        }
      );
      
}