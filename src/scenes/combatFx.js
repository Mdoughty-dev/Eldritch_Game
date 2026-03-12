this.cameras.main.shake(120, 0.01);
          this.tweens.add({
            targets: this.monster,
            x: this.monster.x - 100,
            duration: 250,
            yoyo: true,
            ease: "Linear",
          });
          this.add.text(250, 300, "-30");