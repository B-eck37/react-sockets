import React, { Component } from 'react';
import './components.css';
import '../App.css';

//There is no need to add or install the socket.io-client library,
//it comes included in the original socket.io package and is used on the browser-side of the socket connection
import io from 'socket.io-client';

// There is no specific direction when creating the global socket, it defaults to trying to connect to the host that serves the page AKA the server


export default class Chat extends Component {
    constructor(props){
        super(props);
        this.state = {
            messages: [],
            roomNumber: 1,
            messageBody: '',
            username: '',
            typers: [],
        }
        this.socket = io();
        this.typing = false;

       
        this.sendMessage = e => {
            e.preventDefault();
            this.state.username === '' ? 
                alert('Please Enter your name') :
            this.state.messageBody === '' ?
                alert('Please Enter a message') :
                this.socket.emit('SEND_MESSAGE',{
                    username: this.state.username,
                    messageBody: this.state.messageBody,
                    room: this.state.roomNumber
                });
                this.setState({messageBody: '', messages: []});
            }
                    
            
            
            this.socket.on('RECEIVE_MESSAGE', data => {
                            console.log('Hey', data)
                            addMessage(data);
                    })
        




    // -- Sets state with new messages array returned from server
    const addMessage = data => {
        console.log('add', data)
        this.setState({messages: data})
    }

    // -- Triggered from keystrokes in message input -- emits 'isTyping' to register server function
    this.isTyping = () => {
        console.log('typing')
        this.typing = true;
        this.socket.emit('isTyping', this.state.username)

        // -- If user has stopped typing, this emit to back end 'stopTyping' method
        setTimeout(() => {
            this.typing = false;
            this.socket.emit('stopTyping', this.state.username)
        }, 1000)
    }

    // -- Receives 'currentTyper' from backend with specific User Name and sets state with currentTypers to initiate app notification of who is typing.
    this.socket.on('currentTyper', name => {
        let currentTypers = this.state.typers;
        console.log(name, currentTypers)
       if(currentTypers.indexOf(name) === -1){
            currentTypers.push(name)
       }
        this.setState({
            typers: currentTypers
        })
    })

    // -- Receives name of who has stopped typing to end the app notification
    this.socket.on('previousTyper', name => {
        let previousTypers = this.state.typers;
        previousTypers.forEach((e, i, a) => {
            if( e === name){
                console.log('splice')
                a.splice(i, 1)
            }
        })
        this.setState({
            typers: previousTypers
        })
    })
}

//////////NEEDED IF USING DATABASE//////////////
// componentDidMount(){
//    // Get messages from server on connection
//     setInterval(() => {axios.get('/chat').then(res => {
//         console.log('Chat room messages', res.data)
//         this.setState({messages: res.data})
//     }).catch(err => console.log(err))}, 1000);
//     axios.get('/chat').then(res => {
//             console.log('Chat room messages', res.data)
//             this.setState({messages: res.data})
//         }).catch(err => console.log(err))
// }
 // this.getMessages = () => {
        //     axios.get('/chat').then(res => {
        //         console.log('CDM res', res)
        //         this.setState(() => ({messages: res.data}))
        //     }).catch(err => console.log(err))
        // }
         // axios.post('/chat', {username, messageBody, roomNumber}).then(response => {
            //     console.log('post', response)
            //     this.setState({messages: response.data})
            // }).catch(err => console.log(err))
            // setTimeout(() => {
            //     this.getMessages();
            // }, 500)
// deleteMessage(){
//     axios.delete('/chat/delete').then(response => {
//         this.setState({
//             messages: response.data
//         })
//     })
// }
/////////////////////////////////////////////////////

render(){
    return (
        <div className='grand-dad'>
        <div id='messages'>
            {this.state.messages.length ? this.state.messages.map((message,i) => {
                // console.log(message.username, message.messageBody)
                return (
                    <span key={i}>
                    <strong style={{color: 'purple', marginLeft: '0', textAlign: 'left'}}>{message.username}:</strong>
                    {' '}{message.messageBody}<br/>
                    </span>
                )
            }) : null}
            
        </div>
        {this.state.typers.length < 4? this.state.typers.map((typer, i) => {
            if(typer === this.state.username){
                return null
            } else {
                return (
                    <span key={i} style={{color: 'black', marginRight: '10px'}}>{typer + ' is typing...'}</span>
                )
            }}) : this.state.typers.length >=4 ? <p>There are multiple users typing...</p> : null}
            <br/>
            <br/>
        Name:<br/>
        <input className='input-name' type="text" placeholder='Enter name here' onChange={e => this.setState({username: e.target.value})}/><br/>

        Message: <br/>
        <textarea className='input-message' placeholder='Enter message here' type="text" value={this.state.messageBody} onKeyPress={() => this.isTyping()} onChange={e => this.setState({messageBody: e.target.value})}/><br/>
        <button className='btn' onClick={this.sendMessage}>Send Message</button>
        </div>
    )
}
}