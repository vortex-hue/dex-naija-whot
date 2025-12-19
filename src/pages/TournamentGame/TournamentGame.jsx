import React from "react";
import App from "./App";
import store from "../../redux/playFriendStore";
import { Provider } from "react-redux";

const TournamentGame = () => {
    return (
        <Provider store={store}>
            <App />
        </Provider>
    );
};

export default TournamentGame;
