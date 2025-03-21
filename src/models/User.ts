interface UserInterface {
  _id: string;
  username: string;
  usernameInAllLowercase: string;
  emailAddress: string;
  hashedPassword: string;
  userNumber: number;
  creationDateAndTime: Date;
  statistics: {
    easyModePersonalBestScore: number;
    standardModePersonalBestScore: number;
    gamesPlayed: number;
    totalExperiencePoints: number;
    personalBestScoreOnEasySingleplayerMode: {
      score: number;
      timeInMilliseconds: number;
      scoreSubmissionDateAndTime: Date;
      actionsPerformed: number;
      enemiesKilled: number;
      enemiesCreated: number;
      globalRank: number;
    };
    personalBestScoreOnStandardSingleplayerMode: {
      score: number;
      timeInMilliseconds: number;
      scoreSubmissionDateAndTime: Date;
      actionsPerformed: number;
      enemiesKilled: number;
      enemiesCreated: number;
      globalRank: number;
    };
    multiplayer: {
      gamesPlayed: number;
      gamesWon: number;
    };
  };
  membership: {
    isDeveloper: boolean;
    isAdministrator: boolean;
    isModerator: boolean;
    isContributor: boolean;
    isTester: boolean;
    isDonator: boolean;
    specialRank: string;
  };
}

export { UserInterface };
