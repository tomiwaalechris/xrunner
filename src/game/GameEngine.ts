export interface GameCallbacks {
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
}

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameCallbacks;
  private animationId: number | null = null;
  private isRunning = false;
  
  // Game state
  private score = 0;
  private gameSpeed = 6;
  private groundY: number;
  
  // Player (Eye)
  private player = {
    x: 50,
    y: 0,
    width: 40,
    height: 40,
    velocityY: 0,
    isJumping: false,
    jumpPower: 15,
    gravity: 0.8
  };
  
  // Obstacles
  private obstacles: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'cactus' | 'bird';
  }> = [];
  
  private lastObstacleX = 0;
  private minObstacleDistance = 200;
  private maxObstacleDistance = 400;
  
  // Ground
  private groundX = 0;
  
  constructor(ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.groundY = ctx.canvas.height - 20;
    this.player.y = this.groundY - this.player.height;
  }
  
  getIsRunning() {
    return this.isRunning;
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.gameLoop();
  }
  
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  reset() {
    this.stop();
    this.score = 0;
    this.gameSpeed = 6;
    this.player.y = this.groundY - this.player.height;
    this.player.velocityY = 0;
    this.player.isJumping = false;
    this.obstacles = [];
    this.lastObstacleX = 0;
    this.groundX = 0;
    this.callbacks.onScoreUpdate(0);
  }
  
  jump() {
    if (!this.player.isJumping) {
      this.player.velocityY = -this.player.jumpPower;
      this.player.isJumping = true;
    }
  }
  
  private gameLoop = () => {
    if (!this.isRunning) return;
    
    this.update();
    this.draw();
    
    this.animationId = requestAnimationFrame(this.gameLoop);
  };
  
  private update() {
    // Update score
    this.score += 1;
    if (this.score % 100 === 0) {
      this.gameSpeed += 0.5; // Increase speed every 100 points
    }
    this.callbacks.onScoreUpdate(Math.floor(this.score / 10));
    
    // Update player physics
    if (this.player.isJumping) {
      this.player.y += this.player.velocityY;
      this.player.velocityY += this.player.gravity;
      
      // Land on ground
      if (this.player.y >= this.groundY - this.player.height) {
        this.player.y = this.groundY - this.player.height;
        this.player.velocityY = 0;
        this.player.isJumping = false;
      }
    }
    
    // Update ground
    this.groundX -= this.gameSpeed;
    if (this.groundX <= -50) {
      this.groundX = 0;
    }
    
    // Spawn obstacles
    if (this.obstacles.length === 0 || 
        this.ctx.canvas.width - this.obstacles[this.obstacles.length - 1].x > 
        this.minObstacleDistance + Math.random() * (this.maxObstacleDistance - this.minObstacleDistance)) {
      this.spawnObstacle();
    }
    
    // Update obstacles
    this.obstacles = this.obstacles.filter(obstacle => {
      obstacle.x -= this.gameSpeed;
      return obstacle.x + obstacle.width > 0;
    });
    
    // Check collisions
    this.checkCollisions();
  }
  
  private spawnObstacle() {
    const type = Math.random() > 0.7 ? 'bird' : 'cactus';
    const obstacle = {
      x: this.ctx.canvas.width,
      y: type === 'bird' ? this.groundY - 80 : this.groundY - 40,
      width: type === 'bird' ? 30 : 20,
      height: type === 'bird' ? 20 : 40,
      type
    };
    
    this.obstacles.push(obstacle);
  }
  
  private checkCollisions() {
    const playerRect = {
      x: this.player.x + 5, // Small margin for better gameplay
      y: this.player.y + 5,
      width: this.player.width - 10,
      height: this.player.height - 10
    };
    
    for (const obstacle of this.obstacles) {
      if (playerRect.x < obstacle.x + obstacle.width &&
          playerRect.x + playerRect.width > obstacle.x &&
          playerRect.y < obstacle.y + obstacle.height &&
          playerRect.y + playerRect.height > obstacle.y) {
        this.gameOver();
        return;
      }
    }
  }
  
  private gameOver() {
    this.stop();
    this.callbacks.onGameOver(Math.floor(this.score / 10));
  }
  
  private draw() {
    // Clear canvas
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    // Draw ground
    this.drawGround();
    
    // Draw player (Eye)
    this.drawPlayer();
    
    // Draw obstacles
    this.obstacles.forEach(obstacle => this.drawObstacle(obstacle));
    
    // Draw clouds
    this.drawClouds();
  }
  
  private drawGround() {
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, this.groundY, this.ctx.canvas.width, 20);
    
    // Ground pattern
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 2;
    for (let x = this.groundX; x < this.ctx.canvas.width + 50; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.groundY);
      this.ctx.lineTo(x + 25, this.groundY + 10);
      this.ctx.moveTo(x + 25, this.groundY + 10);
      this.ctx.lineTo(x + 50, this.groundY);
      this.ctx.stroke();
    }
  }
  
  private drawPlayer() {
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    
    // Draw eye body (ellipse)
    this.ctx.fillStyle = '#4F46E5';
    this.ctx.strokeStyle = '#312E81';
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY, this.player.width / 2 - 2, this.player.height / 2 - 5, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw pupil
    this.ctx.fillStyle = '#1F2937';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw iris
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw highlight
    this.ctx.fillStyle = '#E5E7EB';
    this.ctx.beginPath();
    this.ctx.arc(centerX + 1, centerY - 1, 1.5, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  private drawObstacle(obstacle: any) {
    if (obstacle.type === 'cactus') {
      // Draw cactus
      this.ctx.fillStyle = '#228B22';
      this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Cactus details
      this.ctx.fillStyle = '#32CD32';
      this.ctx.fillRect(obstacle.x + 2, obstacle.y + 5, obstacle.width - 4, 5);
      this.ctx.fillRect(obstacle.x + 2, obstacle.y + 15, obstacle.width - 4, 5);
      this.ctx.fillRect(obstacle.x + 2, obstacle.y + 25, obstacle.width - 4, 5);
    } else {
      // Draw bird
      this.ctx.fillStyle = '#8B4513';
      this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Bird wing
      this.ctx.fillStyle = '#A0522D';
      this.ctx.fillRect(obstacle.x + 5, obstacle.y + 3, obstacle.width - 10, obstacle.height - 6);
    }
  }
  
  private drawClouds() {
    // Simple cloud decoration
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    const cloudPositions = [
      { x: 100 - (this.score * 0.1) % 900, y: 30 },
      { x: 300 - (this.score * 0.05) % 900, y: 50 },
      { x: 600 - (this.score * 0.08) % 900, y: 25 }
    ];
    
    cloudPositions.forEach(cloud => {
      if (cloud.x > -100 && cloud.x < this.ctx.canvas.width + 50) {
        this.ctx.beginPath();
        this.ctx.arc(cloud.x, cloud.y, 15, 0, Math.PI * 2);
        this.ctx.arc(cloud.x + 15, cloud.y, 20, 0, Math.PI * 2);
        this.ctx.arc(cloud.x + 30, cloud.y, 15, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }
}