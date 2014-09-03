// set up the new Collection

PlayersList = new Meteor.Collection('players');

// CLIENT SIDE CODE

if(Meteor.isClient){

  Meteor.subscribe('thePlayers');

  if(Meteor.user()){
    console.log("You're logged in!");
  } 

  Template.leaderboard.player = function() {
    var currentUserId = Meteor.userId();
    return PlayersList.find(
    {/*{createdBy: currentUserId}*/},
      {sort: {pushups: -1, name: 1} });
  };

  Template.leaderboard.selectedClass = function() {
    var selectedPlayer = Session.get('selectedPlayer');
    var playerId = this._id;
    if(selectedPlayer === playerId){
      return 'selected';
    }
  };

  Template.leaderboard.showSelectedPlayer = function() {
    var selectedPlayer = Session.get('selectedPlayer');
    return PlayersList.findOne(selectedPlayer);
  };

  Template.leaderboard.checkCreatedByUser = function () {
    var createdBy = Session.get('createdBy');
    if(createdBy === Meteor.userId()){
      return true;
    } else {
      return false;
    }
  };

  Template.leaderboard.events({
    'click .player': function (){
      var playerId = this._id;
      Session.set('selectedPlayer', playerId);
      Session.set('createdBy', this.createdBy);
      var selectedPlayer = Session.get('selectedPlayer');
    },
    'click #increment': function (){
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('modifyPlayerScore', selectedPlayer, 5);
    },
    'click #decrement': function (){
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('modifyPlayerScore', selectedPlayer, -5);
    },
    'click #remove': function (){
      var selectedPlayer = Session.get('selectedPlayer');

      Meteor.call('removePlayer', selectedPlayer);
    }
  });

  Template.addPlayerForm.events({
    'submit form': function (event, theTemplate){
      event.preventDefault();
      var newPlayerName = theTemplate.find('#playerName').value;
      var currentUserId = Meteor.userId();


      Meteor.call('insertPlayerData', newPlayerName);
    }

  });

}

// SERVER SIDE CODE

if(Meteor.isServer){
  Meteor.publish('thePlayers', function() {
    var currentUserId = this.userId;
    return PlayersList.find();
  });

  Meteor.methods({
    'insertPlayerData': function(newPlayerName){
      var currentUserId = Meteor.userId();
      PlayersList.insert({
        name: newPlayerName,
        pushups: 0,
        createdBy: currentUserId
      });
      console.log('you submitted the form');
    },
    'removePlayer': function(selectedPlayer){
      PlayersList.remove(selectedPlayer);
    },
    'modifyPlayerScore': function(selectedPlayer, scoreValue){
      PlayersList.update(
        {_id: selectedPlayer},
        {$inc: {pushups: scoreValue}}
      );
    }
  });

}
