export var gameLog = [];

export function addLogEntry(playerState, actionType, id, cost) {
    if (!playerState || !actionType) {
        console.log("Cannot process log entry - player state: " + playerState + ", entry type: " + actionType);
    } else {
        gameLog.push({playerState: playerState, actionType: actionType, id: id, cost: cost});
        console.log("logged action");
        console.log(gameLog);
    }
}

export function setGameLog(serverLog){
    if (serverLog) {
        gameLog = serverLog;
    } else {
        console.log("Unable to set initial log in setInitialLog: " + serverLog);
    }
}