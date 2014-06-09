if (Meteor.isClient) {
  Template.image.src = function() {
    return 'data:' + this.mime + ';base64,' + this.data;
  }

  Template.images.images = function() {
    return Dropboxer.collection.find();
  }
}