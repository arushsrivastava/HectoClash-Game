// HectoClash - Competitive Mathematical Duels
// Main application JavaScript

class HectoClash {
  constructor() {
    this.currentUser = null;
    this.currentScreen = 'login';
    this.currentView = 'dashboard';
    this.gameData = this.loadGameData();
    this.leaderboardData = this.loadLeaderboardData();
    this.matchmaking = {
      inQueue: false,
      queueStartTime: null,
      queueInterval: null,
      targetMatchTime: null
    };
    this.currentGame = null;
    this.spectatorMode = false;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadUserData();
    this.showScreen('login');
    this.updateUI();
  }

  // Data Management
  loadGameData() {
    const defaultData = {
      samplePuzzles: ["123456", "987654", "246810", "135792", "864209", "573920", "841760", "692315"],
      sampleSolutions: {
        "123456": ["1 + (2 + 3 + 4) × (5 + 6) = 100", "(1 + 2 + 3 + 4) × (5 + 6) - 10 = 100", "12 × (3 + 4) + 5 + 6 + 1 = 100"],
        "987654": ["98 + 7 - 6 + 5 - 4 = 100", "(9 × 8 + 7 + 6) + 5 + 4 = 100"],
        "246810": ["24 × 6 - 8 - 10 - 26 = 100", "2 × (46 + 8) + 10 - 8 = 100"]
      },
      gameRules: {
        timeLimit: 60,
        roundsToWin: 2,
        totalRounds: 3,
        startingRating: 1200,
        ratingChange: 32
      },
      achievements: [
        {name: "First Win", description: "Win your first duel", icon: "🏆"},
        {name: "Speed Demon", description: "Solve a puzzle in under 10 seconds", icon: "⚡"},
        {name: "Century Club", description: "Reach 100 games played", icon: "💯"},
        {name: "Master Calculator", description: "Reach 1500 rating", icon: "🧮"},
        {name: "Puzzle Solver", description: "Win 10 consecutive matches", icon: "🧩"}
      ]
    };
    
    return JSON.parse(localStorage.getItem('hectoclash_gamedata')) || defaultData;
  }

  loadLeaderboardData() {
    const defaultLeaderboard = [
      {username: "MathWizard", rating: 1856, games: 147, winRate: 78, avgTime: 23},
      {username: "CalculusKing", rating: 1792, games: 203, winRate: 73, avgTime: 31},
      {username: "NumberNinja", rating: 1734, games: 89, winRate: 82, avgTime: 19},
      {username: "AlgebraAce", rating: 1698, games: 156, winRate: 69, avgTime: 41},
      {username: "GeometryGuru", rating: 1645, games: 234, winRate: 65, avgTime: 38},
      {username: "StatsStar", rating: 1612, games: 98, winRate: 71, avgTime: 29},
      {username: "TrigTitan", rating: 1589, games: 167, winRate: 63, avgTime: 45},
      {username: "MathMaster", rating: 1567, games: 189, winRate: 68, avgTime: 33}
    ];
    
    return JSON.parse(localStorage.getItem('hectoclash_leaderboard')) || defaultLeaderboard;
  }

  saveGameData() {
    localStorage.setItem('hectoclash_gamedata', JSON.stringify(this.gameData));
    localStorage.setItem('hectoclash_leaderboard', JSON.stringify(this.leaderboardData));
  }

  loadUserData() {
    const userData = localStorage.getItem('hectoclash_user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.showScreen('lobby');
    }
  }

  saveUserData() {
    if (this.currentUser) {
      localStorage.setItem('hectoclash_user', JSON.stringify(this.currentUser));
    }
  }

  // Screen Management
  showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    
    document.getElementById(`${screenName}-screen`).classList.remove('hidden');
    this.currentScreen = screenName;
    
    if (screenName === 'lobby') {
      this.showLobbyView(this.currentView);
    }
  }

  showLobbyView(viewName) {
    document.querySelectorAll('.lobby-view').forEach(view => {
      view.classList.add('hidden');
    });
    
    document.getElementById(`${viewName}-view`).classList.remove('hidden');
    this.currentView = viewName;
    
    // Update navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('nav-active');
    });
    
    const targetLink = document.querySelector(`[data-view="${viewName}"]`);
    if (targetLink) {
      targetLink.classList.add('nav-active');
    }
    
    // Update view-specific content
    this.updateViewContent(viewName);
  }

  updateViewContent(viewName) {
    switch(viewName) {
      case 'dashboard':
        this.updateDashboard();
        break;
      case 'leaderboard':
        this.updateLeaderboard();
        break;
      case 'profile':
        this.updateProfile();
        break;
    }
  }

  // Event Listeners
  setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    document.getElementById('guest-login').addEventListener('click', () => {
      this.handleGuestLogin();
    });

    // Navigation
    document.querySelectorAll('[data-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLobbyView(link.dataset.view);
      });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      this.handleLogout();
    });

    // Game actions
    document.getElementById('find-match-btn').addEventListener('click', () => {
      this.startMatchmaking();
    });

    document.getElementById('queue-btn').addEventListener('click', () => {
      this.toggleQueue();
    });

    document.getElementById('practice-btn').addEventListener('click', () => {
      this.startPracticeMode();
    });

    document.getElementById('start-practice').addEventListener('click', () => {
      this.startPracticeMode();
    });

    // Game controls
    document.getElementById('submit-solution').addEventListener('click', () => {
      this.submitSolution();
    });

    document.getElementById('clear-solution').addEventListener('click', () => {
      this.clearSolution();
    });

    document.getElementById('exit-game').addEventListener('click', () => {
      this.exitGame();
    });

    // Solution input
    document.getElementById('solution-input').addEventListener('input', (e) => {
      this.validateSolution(e.target.value);
    });

    // Operator buttons
    document.querySelectorAll('.operator-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.insertOperator(e.target.dataset.op);
      });
    });

    // Result screen
    document.getElementById('return-lobby').addEventListener('click', () => {
      this.showScreen('lobby');
    });

    document.getElementById('rematch-btn').addEventListener('click', () => {
      this.requestRematch();
    });

    // Spectator mode
    document.getElementById('exit-spectator').addEventListener('click', () => {
      this.exitSpectator();
    });

    // Leaderboard tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchLeaderboardTab(e.target.dataset.tab);
      });
    });
  }

  // Authentication
  handleLogin() {
    const username = document.getElementById('username').value.trim();
    if (username.length < 3) {
      this.showNotification('Username must be at least 3 characters', 'error');
      return;
    }

    this.currentUser = {
      username: username,
      rating: this.gameData.gameRules.startingRating,
      games: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgTime: 0,
      achievements: [],
      matchHistory: [],
      isGuest: false
    };

    this.saveUserData();
    this.showScreen('lobby');
    this.showNotification(`Welcome, ${username}!`, 'success');
  }

  handleGuestLogin() {
    const guestName = `Guest${Math.floor(Math.random() * 10000)}`;
    this.currentUser = {
      username: guestName,
      rating: this.gameData.gameRules.startingRating,
      games: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgTime: 0,
      achievements: [],
      matchHistory: [],
      isGuest: true
    };

    this.showScreen('lobby');
    this.showNotification(`Welcome, ${guestName}!`, 'success');
  }

  handleLogout() {
    if (!this.currentUser.isGuest) {
      this.saveUserData();
    }
    this.currentUser = null;
    localStorage.removeItem('hectoclash_user');
    this.showScreen('login');
    this.showNotification('Logged out successfully', 'success');
  }

  // UI Updates
  updateUI() {
    if (this.currentUser) {
      document.getElementById('current-user').textContent = this.currentUser.username;
      document.getElementById('welcome-name').textContent = this.currentUser.username;
      document.getElementById('user-rating').textContent = this.currentUser.rating;
      document.getElementById('games-played').textContent = this.currentUser.games;
      document.getElementById('win-rate').textContent = `${this.currentUser.winRate}%`;
      document.getElementById('avg-time').textContent = `${this.currentUser.avgTime}s`;
    }
  }

  updateDashboard() {
    this.updateUI();
    this.updateTopPlayers();
    this.updateOnlinePlayers();
    this.updateActiveMatches();
  }

  updateTopPlayers() {
    const topPlayers = this.leaderboardData.slice(0, 5);
    const container = document.getElementById('top-players');
    
    container.innerHTML = topPlayers.map((player, index) => `
      <li class="player-item">
        <span class="player-name">#${index + 1} ${player.username}</span>
        <span class="player-rating">${player.rating}</span>
      </li>
    `).join('');
  }

  updateOnlinePlayers() {
    const onlineCount = Math.floor(Math.random() * 20) + 5;
    document.getElementById('online-count').innerHTML = `
      <i class="fas fa-circle online-icon"></i>
      <span>${onlineCount} Players Online</span>
    `;

    const onlinePlayers = this.generateOnlinePlayers(5);
    const container = document.getElementById('online-players');
    
    container.innerHTML = onlinePlayers.map(player => `
      <li class="player-item">
        <span class="player-name">${player.username}</span>
        <span class="player-rating">${player.rating}</span>
      </li>
    `).join('');
  }

  updateActiveMatches() {
    const activeMatches = this.generateActiveMatches(3);
    const container = document.getElementById('active-matches');
    
    if (activeMatches.length === 0) {
      container.innerHTML = '<li class="empty-state">No active matches at the moment</li>';
      return;
    }

    container.innerHTML = activeMatches.map(match => `
      <li class="match-item" onclick="hectoClash.spectateMatch('${match.id}')">
        <div class="match-players">${match.player1} vs ${match.player2}</div>
        <div class="match-spectators">
          <i class="fas fa-eye"></i> ${match.spectators} watching
        </div>
      </li>
    `).join('');
  }

  updateLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = this.leaderboardData.map((player, index) => `
      <tr>
        <td class="rank">#${index + 1}</td>
        <td class="player-name">${player.username}</td>
        <td class="rating">${player.rating}</td>
        <td>${player.games}</td>
        <td>${player.winRate}%</td>
        <td>${player.avgTime}s</td>
      </tr>
    `).join('');
  }

  updateProfile() {
    if (!this.currentUser) return;

    document.getElementById('profile-rating-value').textContent = this.currentUser.rating;
    document.getElementById('profile-games').textContent = this.currentUser.games;
    document.getElementById('profile-wins').textContent = this.currentUser.wins;
    document.getElementById('profile-winrate').textContent = `${this.currentUser.winRate}%`;

    this.updateAchievements();
  }

  updateAchievements() {
    const container = document.getElementById('achievements-container');
    container.innerHTML = this.gameData.achievements.map(achievement => {
      const earned = this.currentUser.achievements.includes(achievement.name);
      return `
        <div class="achievement-item ${earned ? 'earned' : ''}">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-info">
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // Matchmaking - Fixed implementation
  startMatchmaking() {
    this.showLobbyView('play');
    this.toggleQueue();
  }

  toggleQueue() {
    if (this.matchmaking.inQueue) {
      this.leaveQueue();
    } else {
      this.joinQueue();
    }
  }

  joinQueue() {
    this.matchmaking.inQueue = true;
    this.matchmaking.queueStartTime = Date.now();
    // Set a fixed target match time between 3-8 seconds for better UX
    this.matchmaking.targetMatchTime = this.matchmaking.queueStartTime + (Math.random() * 5000 + 3000);
    
    document.getElementById('queue-status').classList.remove('hidden');
    document.getElementById('queue-btn').textContent = 'Leave Queue';
    document.getElementById('queue-btn').classList.add('btn--secondary');
    document.getElementById('queue-btn').classList.remove('btn--primary');

    this.matchmaking.queueInterval = setInterval(() => {
      this.updateQueueTime();
      
      // Check if we've reached the target match time
      if (Date.now() >= this.matchmaking.targetMatchTime) {
        this.matchFound();
      }
    }, 100); // Update more frequently for smoother timer

    this.showNotification('Joining matchmaking queue...', 'success');
  }

  leaveQueue() {
    this.matchmaking.inQueue = false;
    this.matchmaking.targetMatchTime = null;
    
    if (this.matchmaking.queueInterval) {
      clearInterval(this.matchmaking.queueInterval);
      this.matchmaking.queueInterval = null;
    }

    document.getElementById('queue-status').classList.add('hidden');
    document.getElementById('queue-btn').textContent = 'Join Queue';
    document.getElementById('queue-btn').classList.remove('btn--secondary');
    document.getElementById('queue-btn').classList.add('btn--primary');

    this.showNotification('Left matchmaking queue', 'success');
  }

  updateQueueTime() {
    const elapsed = Math.floor((Date.now() - this.matchmaking.queueStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('queue-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  matchFound() {
    this.leaveQueue();
    this.showNotification('Match found! Preparing game...', 'success');
    
    setTimeout(() => {
      this.startGame();
    }, 1500);
  }

  // Game Logic
  startGame() {
    const opponent = this.generateOpponent();
    this.currentGame = {
      opponent: opponent,
      currentRound: 1,
      playerScore: 0,
      opponentScore: 0,
      currentPuzzle: this.generatePuzzle(),
      timeLeft: this.gameData.gameRules.timeLimit,
      gameTimer: null,
      roundStartTime: Date.now(),
      rounds: []
    };

    this.showScreen('game');
    this.initializeGameUI();
    this.startRound();
  }

  startPracticeMode() {
    const practiceGame = {
      isPractice: true,
      currentPuzzle: this.generatePuzzle(),
      timeLeft: this.gameData.gameRules.timeLimit,
      gameTimer: null,
      roundStartTime: Date.now()
    };

    this.currentGame = practiceGame;
    this.showScreen('game');
    this.initializeGameUI();
    this.startRound();
  }

  initializeGameUI() {
    document.getElementById('player-name').textContent = this.currentUser.username;
    document.getElementById('player-rating').textContent = this.currentUser.rating;
    
    if (!this.currentGame.isPractice) {
      document.getElementById('opponent-name').textContent = this.currentGame.opponent.username;
      document.getElementById('opponent-rating').textContent = this.currentGame.opponent.rating;
      document.getElementById('current-round').textContent = this.currentGame.currentRound;
      document.getElementById('player-score').textContent = this.currentGame.playerScore;
      document.getElementById('opponent-score').textContent = this.currentGame.opponentScore;
      document.getElementById('opponent-side').style.display = 'block';
    } else {
      document.getElementById('opponent-side').style.display = 'none';
      document.getElementById('current-round').textContent = 'Practice';
    }

    document.getElementById('puzzle-digits').textContent = this.currentGame.currentPuzzle;
    document.getElementById('solution-input').value = '';
    document.getElementById('input-feedback').textContent = '';
    
    // Reset timer bar
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = '100%';
    timerBar.classList.remove('warning', 'danger');
    
    // Reset progress bars
    document.querySelector('#player-progress .progress-bar').style.width = '0%';
    if (!this.currentGame.isPractice) {
      document.querySelector('#opponent-progress .progress-bar').style.width = '0%';
    }
  }

  startRound() {
    this.currentGame.timeLeft = this.gameData.gameRules.timeLimit;
    this.currentGame.roundStartTime = Date.now();
    
    this.currentGame.gameTimer = setInterval(() => {
      this.updateTimer();
      
      if (this.currentGame.timeLeft <= 0) {
        this.timeUp();
      }
    }, 1000);

    // Simulate opponent progress
    if (!this.currentGame.isPractice) {
      this.simulateOpponentProgress();
    }
  }

  updateTimer() {
    this.currentGame.timeLeft--;
    document.getElementById('timer-text').textContent = this.currentGame.timeLeft;
    
    const timerBar = document.getElementById('timer-bar');
    const percentage = (this.currentGame.timeLeft / this.gameData.gameRules.timeLimit) * 100;
    timerBar.style.width = `${percentage}%`;
    
    // Remove existing classes first
    timerBar.classList.remove('warning', 'danger');
    
    if (this.currentGame.timeLeft <= 10) {
      timerBar.classList.add('danger');
    } else if (this.currentGame.timeLeft <= 20) {
      timerBar.classList.add('warning');
    }
  }

  simulateOpponentProgress() {
    const opponentSolveTime = Math.random() * 40000 + 15000; // 15-55 seconds
    const opponentSuccess = Math.random() > 0.3; // 70% success rate
    
    if (opponentSuccess) {
      setTimeout(() => {
        if (this.currentGame && this.currentGame.gameTimer && !this.currentGame.isPractice) {
          this.opponentSolved();
        }
      }, opponentSolveTime);
    }
  }

  opponentSolved() {
    if (this.currentGame.isPractice) return;
    
    this.currentGame.opponentScore++;
    document.getElementById('opponent-score').textContent = this.currentGame.opponentScore;
    
    const opponentProgress = document.getElementById('opponent-progress').querySelector('.progress-bar');
    opponentProgress.style.width = '100%';
    
    this.showNotification('Opponent solved the puzzle!', 'warning');
    
    if (this.currentGame.opponentScore >= this.gameData.gameRules.roundsToWin) {
      this.endGame(false);
    } else {
      clearInterval(this.currentGame.gameTimer);
      setTimeout(() => this.nextRound(), 2000);
    }
  }

  validateSolution(expression) {
    const feedback = document.getElementById('input-feedback');
    
    if (!expression.trim()) {
      feedback.textContent = '';
      return false;
    }

    try {
      const isValid = this.isValidHectocSolution(expression, this.currentGame.currentPuzzle);
      if (isValid) {
        feedback.textContent = '✓ Valid solution!';
        feedback.className = 'input-feedback valid';
        return true;
      } else {
        feedback.textContent = '✗ Invalid - check your expression';
        feedback.className = 'input-feedback invalid';
        return false;
      }
    } catch (error) {
      feedback.textContent = '✗ Invalid expression';
      feedback.className = 'input-feedback invalid';
      return false;
    }
  }

  isValidHectocSolution(expression, puzzle) {
    // Clean expression and replace symbols
    const cleanExpr = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
    
    // Check if expression uses all digits from puzzle in order
    const puzzleDigits = puzzle.split('');
    let puzzleIndex = 0;
    let i = 0;
    
    while (i < cleanExpr.length && puzzleIndex < puzzleDigits.length) {
      const char = cleanExpr[i];
      
      if (/\d/.test(char)) {
        if (char === puzzleDigits[puzzleIndex]) {
          puzzleIndex++;
        } else {
          return false; // Digit doesn't match expected order
        }
      }
      i++;
    }
    
    // Check if all puzzle digits were used
    if (puzzleIndex !== puzzleDigits.length) {
      return false;
    }
    
    // Evaluate expression
    try {
      const result = this.evaluateExpression(cleanExpr);
      return Math.abs(result - 100) < 0.001; // Allow for floating point errors
    } catch (error) {
      return false;
    }
  }

  evaluateExpression(expr) {
    // Handle exponentiation first
    expr = expr.replace(/(\d+|\([^)]+\))\^(\d+|\([^)]+\))/g, 'Math.pow($1, $2)');
    
    // Simple validation - only allow safe mathematical operations
    if (!/^[0-9+\-*/().^Math.pow, ]+$/.test(expr)) {
      throw new Error('Invalid characters in expression');
    }
    
    try {
      // Use Function constructor for safer evaluation than eval
      return new Function('return ' + expr)();
    } catch (error) {
      throw new Error('Invalid expression');
    }
  }

  submitSolution() {
    const expression = document.getElementById('solution-input').value.trim();
    
    if (!expression) {
      this.showNotification('Please enter a solution', 'error');
      return;
    }

    if (!this.validateSolution(expression)) {
      this.showNotification('Invalid solution', 'error');
      return;
    }

    const solveTime = (Date.now() - this.currentGame.roundStartTime) / 1000;
    
    if (this.currentGame.isPractice) {
      this.showNotification(`Correct! Solved in ${solveTime.toFixed(1)}s`, 'success');
      setTimeout(() => this.nextPuzzle(), 1500);
      return;
    }

    // Regular game
    clearInterval(this.currentGame.gameTimer);
    
    this.currentGame.playerScore++;
    document.getElementById('player-score').textContent = this.currentGame.playerScore;
    
    const playerProgress = document.getElementById('player-progress').querySelector('.progress-bar');
    playerProgress.style.width = '100%';
    
    this.currentGame.rounds.push({
      round: this.currentGame.currentRound,
      playerSolution: expression,
      playerTime: solveTime,
      winner: 'player'
    });

    this.showNotification(`Correct! Solved in ${solveTime.toFixed(1)}s`, 'success');

    // Check for achievements
    this.checkAchievements(solveTime);

    if (this.currentGame.playerScore >= this.gameData.gameRules.roundsToWin) {
      setTimeout(() => this.endGame(true), 1500);
    } else {
      setTimeout(() => this.nextRound(), 2000);
    }
  }

  checkAchievements(solveTime) {
    const achievements = [];
    
    if (solveTime < 10 && !this.currentUser.achievements.includes('Speed Demon')) {
      achievements.push('Speed Demon');
    }
    
    if (this.currentUser.games === 0 && !this.currentUser.achievements.includes('First Win')) {
      achievements.push('First Win');
    }
    
    achievements.forEach(achievement => {
      if (!this.currentUser.achievements.includes(achievement)) {
        this.currentUser.achievements.push(achievement);
        this.showNotification(`Achievement unlocked: ${achievement}!`, 'success');
      }
    });
  }

  nextPuzzle() {
    this.currentGame.currentPuzzle = this.generatePuzzle();
    document.getElementById('puzzle-digits').textContent = this.currentGame.currentPuzzle;
    document.getElementById('solution-input').value = '';
    document.getElementById('input-feedback').textContent = '';
    
    // Reset progress bars
    document.querySelector('#player-progress .progress-bar').style.width = '0%';
    
    this.startRound();
  }

  nextRound() {
    this.currentGame.currentRound++;
    this.currentGame.currentPuzzle = this.generatePuzzle();
    
    document.getElementById('current-round').textContent = this.currentGame.currentRound;
    document.getElementById('puzzle-digits').textContent = this.currentGame.currentPuzzle;
    document.getElementById('solution-input').value = '';
    document.getElementById('input-feedback').textContent = '';
    
    // Reset progress bars
    document.querySelector('#player-progress .progress-bar').style.width = '0%';
    document.querySelector('#opponent-progress .progress-bar').style.width = '0%';
    
    this.startRound();
  }

  timeUp() {
    clearInterval(this.currentGame.gameTimer);
    
    if (this.currentGame.isPractice) {
      this.showNotification('Time\'s up! Try another puzzle.', 'warning');
      setTimeout(() => this.nextPuzzle(), 1500);
      return;
    }

    this.showNotification('Time\'s up!', 'warning');
    
    // Check if opponent might still solve it
    if (Math.random() > 0.6) {
      setTimeout(() => this.opponentSolved(), 1000);
    } else {
      setTimeout(() => this.nextRound(), 2000);
    }
  }

  endGame(playerWon) {
    if (this.currentGame.gameTimer) {
      clearInterval(this.currentGame.gameTimer);
    }
    
    // Update player stats
    this.currentUser.games++;
    if (playerWon) {
      this.currentUser.wins++;
    } else {
      this.currentUser.losses++;
    }
    
    this.currentUser.winRate = Math.round((this.currentUser.wins / this.currentUser.games) * 100);
    
    // Update rating
    const ratingChange = this.calculateRatingChange(playerWon);
    this.currentUser.rating += ratingChange;
    
    // Save user data
    this.saveUserData();
    
    // Show result screen
    setTimeout(() => this.showResultScreen(playerWon, ratingChange), 1000);
  }

  calculateRatingChange(won) {
    const baseChange = this.gameData.gameRules.ratingChange;
    return won ? baseChange : -baseChange;
  }

  showResultScreen(playerWon, ratingChange) {
    document.getElementById('result-title').textContent = playerWon ? 'Victory!' : 'Defeat';
    document.getElementById('result-player-name').textContent = this.currentUser.username;
    document.getElementById('result-player-score').textContent = this.currentGame.playerScore;
    document.getElementById('result-opponent-name').textContent = this.currentGame.opponent.username;
    document.getElementById('result-opponent-score').textContent = this.currentGame.opponentScore;
    
    const playerRatingChange = document.getElementById('player-rating-change');
    playerRatingChange.textContent = (ratingChange > 0 ? '+' : '') + ratingChange;
    playerRatingChange.className = `rating-change ${ratingChange > 0 ? 'positive' : 'negative'}`;
    
    const opponentRatingChange = document.getElementById('opponent-rating-change');
    opponentRatingChange.textContent = (ratingChange > 0 ? '-' : '+') + Math.abs(ratingChange);
    opponentRatingChange.className = `rating-change ${ratingChange > 0 ? 'negative' : 'positive'}`;
    
    // Show optimal solutions
    this.showOptimalSolutions();
    
    this.showScreen('result');
  }

  showOptimalSolutions() {
    const solutions = this.gameData.sampleSolutions[this.currentGame.currentPuzzle] || [];
    const container = document.getElementById('optimal-solutions');
    
    if (solutions.length === 0) {
      container.innerHTML = '<li>No optimal solutions available for this puzzle.</li>';
      return;
    }
    
    container.innerHTML = solutions.map(solution => `<li>${solution}</li>`).join('');
  }

  clearSolution() {
    document.getElementById('solution-input').value = '';
    document.getElementById('input-feedback').textContent = '';
  }

  insertOperator(operator) {
    const input = document.getElementById('solution-input');
    const cursorPos = input.selectionStart;
    const value = input.value;
    
    input.value = value.slice(0, cursorPos) + operator + value.slice(cursorPos);
    input.setSelectionRange(cursorPos + operator.length, cursorPos + operator.length);
    input.focus();
    
    this.validateSolution(input.value);
  }

  exitGame() {
    if (this.currentGame && this.currentGame.gameTimer) {
      clearInterval(this.currentGame.gameTimer);
    }
    
    this.currentGame = null;
    this.showScreen('lobby');
  }

  requestRematch() {
    this.showNotification('Rematch requested! Finding new opponent...', 'success');
    setTimeout(() => {
      this.startGame();
    }, 2000);
  }

  // Spectator Mode
  spectateMatch(matchId) {
    this.spectatorMode = true;
    this.showScreen('spectator');
    this.initializeSpectatorMode(matchId);
  }

  initializeSpectatorMode(matchId) {
    // Simulate spectator data
    const match = {
      player1: { username: 'Player1', rating: 1500, score: 1 },
      player2: { username: 'Player2', rating: 1450, score: 0 },
      currentRound: 2,
      puzzle: this.generatePuzzle(),
      timeLeft: 45,
      viewers: Math.floor(Math.random() * 20) + 1
    };

    document.getElementById('spec-player1-name').textContent = match.player1.username;
    document.getElementById('spec-player1-rating').textContent = match.player1.rating;
    document.getElementById('spec-player1-score').textContent = match.player1.score;
    document.getElementById('spec-player2-name').textContent = match.player2.username;
    document.getElementById('spec-player2-rating').textContent = match.player2.rating;
    document.getElementById('spec-player2-score').textContent = match.player2.score;
    document.getElementById('spec-current-round').textContent = match.currentRound;
    document.getElementById('spec-puzzle-digits').textContent = match.puzzle;
    document.getElementById('viewers-count').textContent = match.viewers;

    this.simulateSpectatorMatch(match);
  }

  simulateSpectatorMatch(match) {
    // Simulate live match progress
    const timer = setInterval(() => {
      match.timeLeft--;
      document.getElementById('spec-timer-text').textContent = match.timeLeft;
      
      const percentage = (match.timeLeft / 60) * 100;
      document.getElementById('spec-timer-bar').style.width = `${percentage}%`;
      
      if (match.timeLeft <= 0) {
        clearInterval(timer);
        this.showNotification('Match ended!', 'info');
      }
    }, 1000);
  }

  exitSpectator() {
    this.spectatorMode = false;
    this.showScreen('lobby');
  }

  // Utility Functions
  generatePuzzle() {
    const puzzles = this.gameData.samplePuzzles;
    return puzzles[Math.floor(Math.random() * puzzles.length)];
  }

  generateOpponent() {
    const names = ['MathBot', 'Calculator', 'NumberCruncher', 'AlgebraAI', 'GeometryGuru', 'StatsMaster'];
    const name = names[Math.floor(Math.random() * names.length)];
    const rating = this.currentUser.rating + (Math.random() * 200 - 100); // ±100 rating difference
    
    return {
      username: name,
      rating: Math.max(1000, Math.round(rating))
    };
  }

  generateOnlinePlayers(count) {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const players = [];
    
    for (let i = 0; i < count; i++) {
      players.push({
        username: names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 100),
        rating: Math.floor(Math.random() * 1000) + 1000
      });
    }
    
    return players;
  }

  generateActiveMatches(count) {
    const matches = [];
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
    
    for (let i = 0; i < count; i++) {
      const player1 = names[Math.floor(Math.random() * names.length)];
      const player2 = names[Math.floor(Math.random() * names.length)];
      
      if (player1 !== player2) {
        matches.push({
          id: `match_${i}`,
          player1: player1,
          player2: player2,
          spectators: Math.floor(Math.random() * 10) + 1
        });
      }
    }
    
    return matches;
  }

  switchLeaderboardTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update leaderboard based on tab
    this.updateLeaderboard();
  }

  showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
}

// Initialize the application
const hectoClash = new HectoClash();