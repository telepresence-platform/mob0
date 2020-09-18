class App {
  constructor() {
    this.onData = this.onData.bind(this);
    this.onPositionChanged = this.onPositionChanged.bind(this);
    this.onPositionError = this.onPositionError.bind(this);

    this.init();
  }

  async init() {
    const url = new URL(document.URL);
    const key = url.searchParams.get("key");
    const roomId = url.searchParams.get("room");
    const isProvider = !!url.searchParams.get("provider");
    console.log(key);
    console.log(roomId);
    console.log(this.isProvider);

    this.map = new google.maps.Map(document.querySelector("main"), { zoom: 15 });
    this.provider = new google.maps.Marker({
      position: new google.maps.LatLng(35.7139014, 139.7601034),
      map: this.map,
      icon: "pin_leg.png",
    });

    const peer = await this.connectPeer(key);
    this.room = peer.joinRoom(roomId, { mode: "mesh" });
    this.room.on("data", this.onData);

    if (isProvider) {
      navigator.geolocation.watchPosition(this.onPositionChanged, this.onPositionError);
    }
  }

  connectPeer(key) {
    return new Promise(r => {
      const peer = new Peer({ key: key });
      peer.on("open", () => r(peer));
    });
  }

  onData({ data }) {
    const { latitude, longitude } = data;

    const latlng = new google.maps.LatLng(latitude, longitude);
    this.provider.setPosition(latlng);
    this.map.panTo(latlng);
  }

  onPositionChanged(position) {
    const { latitude, longitude } = position.coords;
    this.room.send({ latitude, longitude });
    this.onData({ data: { latitude, longitude } });
  }

  onPositionError(error) {
    console.error(error);
  }
}

function initMap() {
  new App();
}
