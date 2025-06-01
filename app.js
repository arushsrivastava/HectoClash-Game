// HectoClash Game Application
class HectoClash {
    constructor() {
        this.currentScreen = 'login-screen';
        this.currentUser = null;
        this.gameState = null;
        this.practiceState = null;
        this.spectatorState = null;
        this.gameTimer = null;
        this.matchingTimer = null;
        
        // Sample data from application_data_json
        this.samplePuzzles = [
            {"sequence": "123456", "solutions": ["1 + (2 + 3 + 4) * (5 + 6)", "12 + 34 + 56 - 2"]},
            {"sequence": "234567", "solutions": ["2 * 3 * 4 * 5 - 6 - 7 + 33", "(2 + 3) * (4 * 5 - 6) + 7"]},
            {"sequence": "345678", "solutions": ["3 * 4 * (5 + 6) - 7 - 8 + 47", "34 + 56 + 7 + 8 - 5"]},
            {"sequence": "456789", "solutions": ["4 * 5 * 6 - 7 - 8 - 9 + 4", "45 + 67 - 8 - 9 + 5"]},
            {"sequence": "567891", "solutions": ["5 * 6 * 7 - 8 * 9 + 1 - 142", "(5 + 6) * (7 + 8) - 9 * 1 - 56"]},
            {"sequence": "678912", "solutions": ["6 * 7 * 8 - 9 * 12 - 228", "67 + 8 + 9 + 12 + 4"]},
            {"sequence": "789123", "solutions": ["7 * 8 + 9 + 12 + 3 + 20", "(7 + 8) * (9 - 1) - 2 * 3 - 4"]},
            {"sequence": "891234", "solutions": ["8 * 9 + 12 + 3 + 4 + 9", "89 + 12 - 3 + 4 - 2"]},
            {"sequence": "912345", "solutions": ["9 * 12 - 3 - 4 - 5 + 20", "91 + 2 + 3 + 4 + 0"]},
            {"sequence": "135792", "solutions": ["1 * 3 * 5 * 7 - 9 + 2 + 2", "13 + 57 + 9 * 2 + 12"]}
        ];
        
        this.leaderboard = [
            {"username": "MathMaster", "rating": 1850, "wins": 45, "games": 52},
            {"username": "Calculator", "rating": 1720, "wins": 38, "games": 44},
            {"username": "NumberNinja", "rating": 1650, "wins": 31, "games": 40},
            {"username": "PuzzlePro", "rating": 1580, "wins": 29, "games": 38},
            {"username": "AlgebraAce", "rating": 1520, "wins": 26, "games": 35}
        ];
        
        this.gameSettings = {
            duelTimeLimit: 180,
            practiceMode: true,
            hintsEnabled: true
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showScreen('login-screen');
    }
    
    setupEventListeners() {
        // Login
        document.getElementById('join-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
        
        // Lobby actions
        document.getElementById('quick-match-btn').addEventListener('click', () => this.startQuickMatch());
        document.getElementById('practice-btn').addEventListener('click', () => this.startPractice());
        document.getElementById('view-full-leaderboard').addEventListener('click', () => this.showFullLeaderboard());
        
        // Game actions
        document.getElementById('player1-input').addEventListener('input', (e) => this.handleExpressionInput(e.target.value));
        document.getElementById('player1-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkPlayerSolution();
        });
        document.getElementById('quit-game-btn').addEventListener('click', () => this.quitGame());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        
        // Practice actions
        document.getElementById('back-to-lobby').addEventListener('click', () => this.showScreen('lobby-screen'));
        document.getElementById('new-puzzle-btn').addEventListener('click', () => this.generateNewPracticePuzzle());
        document.getElementById('practice-input').addEventListener('input', (e) => this.handlePracticeInput(e.target.value));
        document.getElementById('practice-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkPracticeSolution();
        });
        document.getElementById('check-solution-btn').addEventListener('click', () => this.checkPracticeSolution());
        document.getElementById('get-hint-btn').addEventListener('click', () => this.showPracticeHint());
        
        // Results actions
        document.getElementById('play-again-btn').addEventListener('click', () => this.startQuickMatch());
        document.getElementById('back-to-lobby-results').addEventListener('click', () => this.showScreen('lobby-screen'));
        
        // Spectator actions
        document.getElementById('stop-spectating').addEventListener('click', () => this.showScreen('lobby-screen'));
        
        // Matching actions
        document.getElementById('cancel-match').addEventListener('click', () => this.cancelMatching());
        
        // Spectate buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('spectate-btn')) {
                this.startSpectating();
            }
        });
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
        
        // Update screen-specific content
        if (screenId === 'lobby-screen') {
            this.updateLobby();
        }
    }
    
    handleLogin() {
        const username = document.getElementById('username').value.trim();
        if (!username) {
            alert('Please enter a username');
            return;
        }
        
        this.currentUser = {
            username: username,
            rating: 1200,
            gamesPlayed: 0,
            gamesWon: 0,
            totalSolveTime: 0,
            fastestSolve: null,
            achievements: []
        };
        
        this.showScreen('lobby-screen');
    }
    
    updateLobby() {
        if (!this.currentUser) return;
        
        // Update player info
        document.getElementById('player-name').textContent = this.currentUser.username;
        document.getElementById('player-rating').textContent = this.currentUser.rating;
        
        // Update stats
        document.getElementById('games-played').textContent = this.currentUser.gamesPlayed;
        const winRate = this.currentUser.gamesPlayed > 0 
            ? Math.round((this.currentUser.gamesWon / this.currentUser.gamesPlayed) * 100)
            : 0;
        document.getElementById('win-rate').textContent = winRate + '%';
        
        const avgTime = this.currentUser.gamesPlayed > 0 && this.currentUser.totalSolveTime > 0
            ? Math.round(this.currentUser.totalSolveTime / this.currentUser.gamesPlayed)
            : null;
        document.getElementById('avg-time').textContent = avgTime ? this.formatTime(avgTime) : '--';
        document.getElementById('fastest-solve').textContent = this.currentUser.fastestSolve 
            ? this.formatTime(this.currentUser.fastestSolve) 
            : '--';
        
        // Update leaderboard
        this.updateLeaderboardDisplay();
        
        // Update active games (simulated)
        this.updateActiveGames();
    }
    
    updateLeaderboardDisplay() {
        const container = document.getElementById('leaderboard-list');
        container.innerHTML = '';
        
        // Add current user to leaderboard if they have games
        let displayLeaderboard = [...this.leaderboard];
        if (this.currentUser.gamesPlayed > 0) {
            displayLeaderboard.push({
                username: this.currentUser.username,
                rating: this.currentUser.rating,
                wins: this.currentUser.gamesWon,
                games: this.currentUser.gamesPlayed
            });
            displayLeaderboard.sort((a, b) => b.rating - a.rating);
        }
        
        displayLeaderboard.slice(0, 5).forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="leaderboard-rank">${index + 1}</span>
                <span class="leaderboard-name">${player.username}</span>
                <span class="leaderboard-rating">${player.rating}</span>
            `;
            container.appendChild(item);
        });
    }
    
    updateActiveGames() {
        const container = document.getElementById('active-games-list');
        container.innerHTML = '';
        
        // Simulate some active games
        const activeGames = [
            { player1: 'MathMaster', player2: 'Calculator' },
            { player1: 'NumberNinja', player2: 'PuzzlePro' }
        ];
        
        activeGames.forEach(game => {
            const item = document.createElement('div');
            item.className = 'game-item';
            item.innerHTML = `
                <div class="game-players">
                    <span>${game.player1} vs ${game.player2}</span>
                </div>
                <button class="btn btn--outline btn--sm spectate-btn">Spectate</button>
            `;
            container.appendChild(item);
        });
    }
    
    startQuickMatch() {
        this.showScreen('matching-screen');
        
        // Simulate finding opponent
        this.matchingTimer = setTimeout(() => {
            this.startDuel();
        }, 2000 + Math.random() * 3000); // 2-5 seconds
    }
    
    cancelMatching() {
        if (this.matchingTimer) {
            clearTimeout(this.matchingTimer);
            this.matchingTimer = null;
        }
        this.showScreen('lobby-screen');
    }
    
    startDuel() {
        const opponent = this.generateOpponent();
        const puzzle = this.generateRandomPuzzle();
        
        this.gameState = {
            mode: 'duel',
            puzzle: puzzle,
            opponent: opponent,
            timeRemaining: this.gameSettings.duelTimeLimit,
            player1Solutions: [],
            player2Solutions: [],
            gameStartTime: Date.now(),
            isActive: true,
            player1SolveTime: null,
            player2SolveTime: null
        };
        
        this.showScreen('game-screen');
        this.initializeDuel();
    }
    
    initializeDuel() {
        // Set up UI
        document.getElementById('puzzle-sequence').textContent = this.gameState.puzzle.sequence.split('').join(' ');
        document.getElementById('player1-name').textContent = this.currentUser.username;
        document.getElementById('player2-name').textContent = this.gameState.opponent.username;
        document.getElementById('player1-status').textContent = 'Solving...';
        document.getElementById('player2-status').textContent = 'Solving...';
        document.getElementById('player1-solutions').innerHTML = '';
        document.getElementById('player2-solutions').innerHTML = '';
        document.getElementById('player1-input').value = '';
        document.getElementById('player1-feedback').textContent = '';
        
        // Start timer
        this.startGameTimer();
        
        // Simulate opponent activity
        this.simulateOpponentActivity();
    }
    
    startGameTimer() {
        this.updateTimerDisplay();
        
        this.gameTimer = setInterval(() => {
            if (this.gameState && this.gameState.isActive) {
                this.gameState.timeRemaining--;
                this.updateTimerDisplay();
                
                if (this.gameState.timeRemaining <= 0) {
                    this.endGame('timeout');
                }
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const time = this.formatTime(this.gameState.timeRemaining);
        document.getElementById('time-remaining').textContent = time;
        
        // Add warning color when time is low
        const timerElement = document.querySelector('.timer');
        if (this.gameState.timeRemaining <= 30) {
            timerElement.style.color = 'var(--color-error)';
        } else if (this.gameState.timeRemaining <= 60) {
            timerElement.style.color = 'var(--color-warning)';
        }
    }
    
    simulateOpponentActivity() {
        if (!this.gameState || !this.gameState.isActive) return;
        
        const delay = 3000 + Math.random() * 10000; // 3-13 seconds
        
        setTimeout(() => {
            if (this.gameState && this.gameState.isActive && this.gameState.player2Solutions.length === 0) {
                // Opponent finds a solution
                const solution = this.gameState.puzzle.solutions[0];
                this.gameState.player2Solutions.push(solution);
                this.gameState.player2SolveTime = Date.now() - this.gameState.gameStartTime;
                
                document.getElementById('player2-status').textContent = 'Solved!';
                document.getElementById('player2-status').classList.add('solved');
                
                const solutionElement = document.createElement('div');
                solutionElement.className = 'solution-item';
                solutionElement.textContent = solution;
                document.getElementById('player2-solutions').appendChild(solutionElement);
                
                this.endGame('opponent_won');
            }
        }, delay);
    }
    
    handleExpressionInput(expression) {
        if (!this.gameState || !this.gameState.isActive) return;
        
        const feedback = document.getElementById('player1-feedback');
        
        if (!expression.trim()) {
            feedback.textContent = '';
            feedback.className = 'input-feedback';
            return;
        }
        
        const isValid = this.validateExpression(expression, this.gameState.puzzle.sequence);
        
        if (isValid.valid && isValid.result === 100) {
            feedback.textContent = 'Correct! Equals 100';
            feedback.className = 'input-feedback valid';
        } else if (isValid.valid) {
            feedback.textContent = `Equals ${isValid.result} (need 100)`;
            feedback.className = 'input-feedback invalid';
        } else {
            feedback.textContent = isValid.error || 'Invalid expression';
            feedback.className = 'input-feedback invalid';
        }
    }
    
    checkPlayerSolution() {
        if (!this.gameState || !this.gameState.isActive) return;
        
        const expression = document.getElementById('player1-input').value.trim();
        const validation = this.validateExpression(expression, this.gameState.puzzle.sequence);
        
        if (validation.valid && validation.result === 100) {
            // Player found a solution
            if (!this.gameState.player1Solutions.includes(expression)) {
                this.gameState.player1Solutions.push(expression);
                this.gameState.player1SolveTime = Date.now() - this.gameState.gameStartTime;
                
                const solutionElement = document.createElement('div');
                solutionElement.className = 'solution-item';
                solutionElement.textContent = expression;
                document.getElementById('player1-solutions').appendChild(solutionElement);
                
                document.getElementById('player1-status').textContent = 'Solved!';
                document.getElementById('player1-status').classList.add('solved');
                document.getElementById('player1-input').value = '';
                document.getElementById('player1-feedback').textContent = '';
                
                this.endGame('player_won');
            }
        }
    }
    
    endGame(result) {
        if (!this.gameState) return;
        
        this.gameState.isActive = false;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        // Update player stats
        this.currentUser.gamesPlayed++;
        
        let ratingChange = 0;
        if (result === 'player_won') {
            this.currentUser.gamesWon++;
            ratingChange = 15;
            
            if (this.gameState.player1SolveTime) {
                this.currentUser.totalSolveTime += Math.round(this.gameState.player1SolveTime / 1000);
                
                if (!this.currentUser.fastestSolve || this.gameState.player1SolveTime < this.currentUser.fastestSolve * 1000) {
                    this.currentUser.fastestSolve = Math.round(this.gameState.player1SolveTime / 1000);
                }
            }
        } else if (result === 'opponent_won') {
            ratingChange = -10;
        } else if (result === 'timeout') {
            ratingChange = -5;
        }
        
        this.currentUser.rating += ratingChange;
        
        // Show results
        this.showGameResults(result, ratingChange);
    }
    
    showGameResults(result, ratingChange) {
        const resultText = result === 'player_won' ? 'Victory!' : 
                          result === 'opponent_won' ? 'Defeat!' : 'Time\'s Up!';
        
        document.getElementById('game-result').textContent = resultText;
        document.getElementById('result-player1').textContent = this.currentUser.username;
        document.getElementById('result-player2').textContent = this.gameState.opponent.username;
        
        document.getElementById('result-p1-solutions').textContent = this.gameState.player1Solutions.length;
        document.getElementById('result-p2-solutions').textContent = this.gameState.player2Solutions.length;
        
        document.getElementById('result-p1-time').textContent = this.gameState.player1SolveTime 
            ? this.formatTime(Math.round(this.gameState.player1SolveTime / 1000))
            : '--';
        document.getElementById('result-p2-time').textContent = this.gameState.player2SolveTime
            ? this.formatTime(Math.round(this.gameState.player2SolveTime / 1000))
            : '--';
        
        // Show optimal solutions
        const optimalContainer = document.getElementById('optimal-solutions-list');
        optimalContainer.innerHTML = '';
        this.gameState.puzzle.solutions.forEach(solution => {
            const item = document.createElement('div');
            item.className = 'solution-item';
            item.textContent = solution;
            optimalContainer.appendChild(item);
        });
        
        // Show rating change
        const ratingChangeElement = document.getElementById('rating-change-value');
        ratingChangeElement.textContent = (ratingChange >= 0 ? '+' : '') + ratingChange;
        ratingChangeElement.className = ratingChange >= 0 ? '' : 'negative';
        
        this.showScreen('results-screen');
    }
    
    quitGame() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        this.gameState = null;
        this.showScreen('lobby-screen');
    }
    
    showHint() {
        if (!this.gameState || this.gameState.player1Solutions.length > 0) return;
        
        const solution = this.gameState.puzzle.solutions[0];
        const hint = this.generateHint(solution);
        
        document.getElementById('player1-feedback').textContent = `Hint: ${hint}`;
        document.getElementById('player1-feedback').className = 'input-feedback';
    }
    
    generateHint(solution) {
        const hints = [
            "Try using parentheses to group operations",
            "Consider combining adjacent digits",
            "Look for multiplication opportunities",
            "Think about the order of operations",
            "Try different operator combinations"
        ];
        return hints[Math.floor(Math.random() * hints.length)];
    }
    
    startPractice() {
        this.practiceState = {
            puzzle: this.generateRandomPuzzle(),
            solutions: []
        };
        
        this.showScreen('practice-screen');
        this.updatePracticeDisplay();
    }
    
    updatePracticeDisplay() {
        document.getElementById('practice-sequence').textContent = 
            this.practiceState.puzzle.sequence.split('').join(' ');
        document.getElementById('practice-input').value = '';
        document.getElementById('practice-feedback').textContent = '';
        
        // Update solutions list
        const solutionsContainer = document.getElementById('practice-solutions-list');
        solutionsContainer.innerHTML = '';
        this.practiceState.solutions.forEach(solution => {
            const item = document.createElement('div');
            item.className = 'solution-item';
            item.textContent = solution;
            solutionsContainer.appendChild(item);
        });
    }
    
    generateNewPracticePuzzle() {
        this.practiceState.puzzle = this.generateRandomPuzzle();
        this.practiceState.solutions = [];
        this.updatePracticeDisplay();
    }
    
    handlePracticeInput(expression) {
        if (!this.practiceState) return;
        
        const feedback = document.getElementById('practice-feedback');
        
        if (!expression.trim()) {
            feedback.textContent = '';
            feedback.className = 'input-feedback';
            return;
        }
        
        const isValid = this.validateExpression(expression, this.practiceState.puzzle.sequence);
        
        if (isValid.valid && isValid.result === 100) {
            feedback.textContent = 'Correct! Equals 100';
            feedback.className = 'input-feedback valid';
        } else if (isValid.valid) {
            feedback.textContent = `Equals ${isValid.result} (need 100)`;
            feedback.className = 'input-feedback invalid';
        } else {
            feedback.textContent = isValid.error || 'Invalid expression';
            feedback.className = 'input-feedback invalid';
        }
    }
    
    checkPracticeSolution() {
        if (!this.practiceState) return;
        
        const expression = document.getElementById('practice-input').value.trim();
        const validation = this.validateExpression(expression, this.practiceState.puzzle.sequence);
        
        if (validation.valid && validation.result === 100) {
            if (!this.practiceState.solutions.includes(expression)) {
                this.practiceState.solutions.push(expression);
                this.updatePracticeDisplay();
            }
        }
    }
    
    showPracticeHint() {
        if (!this.practiceState) return;
        
        const solution = this.practiceState.puzzle.solutions[0];
        const hint = this.generateHint(solution);
        
        document.getElementById('practice-feedback').textContent = `Hint: ${hint}`;
        document.getElementById('practice-feedback').className = 'input-feedback';
    }
    
    startSpectating() {
        this.spectatorState = {
            game: {
                player1: 'MathMaster',
                player2: 'Calculator',
                puzzle: this.generateRandomPuzzle(),
                timeRemaining: 120
            }
        };
        
        this.showScreen('spectator-screen');
        this.updateSpectatorDisplay();
        this.simulateSpectatorGame();
    }
    
    updateSpectatorDisplay() {
        document.getElementById('spectator-sequence').textContent = 
            this.spectatorState.game.puzzle.sequence.split('').join(' ');
        document.getElementById('spec-player1').textContent = this.spectatorState.game.player1;
        document.getElementById('spec-player2').textContent = this.spectatorState.game.player2;
        document.getElementById('spectator-timer').textContent = this.formatTime(this.spectatorState.game.timeRemaining);
    }
    
    simulateSpectatorGame() {
        const timer = setInterval(() => {
            if (this.spectatorState && this.currentScreen === 'spectator-screen') {
                this.spectatorState.game.timeRemaining--;
                document.getElementById('spectator-timer').textContent = 
                    this.formatTime(this.spectatorState.game.timeRemaining);
                
                if (this.spectatorState.game.timeRemaining <= 0) {
                    clearInterval(timer);
                    document.getElementById('spec-status1').textContent = 'Game Over';
                    document.getElementById('spec-status2').textContent = 'Game Over';
                }
            } else {
                clearInterval(timer);
            }
        }, 1000);
    }
    
    // Utility Functions
    
    generateRandomPuzzle() {
        // Sometimes use sample puzzles, sometimes generate random
        if (Math.random() < 0.7) {
            return this.samplePuzzles[Math.floor(Math.random() * this.samplePuzzles.length)];
        }
        
        // Generate random 6-digit sequence
        const digits = [];
        for (let i = 0; i < 6; i++) {
            digits.push(Math.floor(Math.random() * 9) + 1);
        }
        
        return {
            sequence: digits.join(''),
            solutions: ['12 + 34 + 56 - 2'] // Simplified for random puzzles
        };
    }
    
    generateOpponent() {
        const opponents = [
            { username: 'Calculator', rating: 1650 },
            { username: 'NumberNinja', rating: 1580 },
            { username: 'MathBot', rating: 1520 },
            { username: 'AlgebraAce', rating: 1480 },
            { username: 'DigitMaster', rating: 1450 }
        ];
        
        return opponents[Math.floor(Math.random() * opponents.length)];
    }
    
    validateExpression(expression, sequence) {
        try {
            // Clean and validate the expression
            const cleanExpr = this.cleanExpression(expression);
            
            // Check if expression uses digits in correct order
            if (!this.validateDigitOrder(cleanExpr, sequence)) {
                return { valid: false, error: 'Must use digits in order: ' + sequence.split('').join(' ') };
            }
            
            // Evaluate the mathematical expression
            const result = this.evaluateExpression(cleanExpr);
            
            return { valid: true, result: result };
        } catch (error) {
            return { valid: false, error: 'Invalid mathematical expression' };
        }
    }
    
    cleanExpression(expr) {
        // Replace common symbols with standard operators
        return expr.replace(/×/g, '*')
                  .replace(/÷/g, '/')
                  .replace(/\^/g, '**')
                  .replace(/\s+/g, '');
    }
    
    validateDigitOrder(expr, sequence) {
        // Extract digits from expression maintaining order
        const exprDigits = expr.match(/\d/g) || [];
        const seqDigits = sequence.split('');
        
        if (exprDigits.length !== seqDigits.length) return false;
        
        for (let i = 0; i < exprDigits.length; i++) {
            if (exprDigits[i] !== seqDigits[i]) return false;
        }
        
        return true;
    }
    
    evaluateExpression(expr) {
        // Simple expression evaluator (supports +, -, *, /, **, parentheses)
        try {
            // Security: only allow safe mathematical expressions
            if (!/^[\d+\-*/().^*\s]+$/.test(expr)) {
                throw new Error('Invalid characters');
            }
            
            // Use Function constructor as safer alternative to eval
            const result = new Function('return ' + expr)();
            
            if (typeof result !== 'number' || !isFinite(result)) {
                throw new Error('Invalid result');
            }
            
            return Math.round(result * 1000) / 1000; // Round to 3 decimal places
        } catch (error) {
            throw new Error('Expression evaluation failed');
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    showFullLeaderboard() {
        // Simple alert for now - could be expanded to modal
        let leaderboardText = 'Full Leaderboard:\n\n';
        this.leaderboard.forEach((player, index) => {
            leaderboardText += `${index + 1}. ${player.username} (${player.rating})\n`;
        });
        alert(leaderboardText);
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.hectoClash = new HectoClash();
});