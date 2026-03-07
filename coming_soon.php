<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coming Soon | BdRising</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            overflow: hidden;
            position: relative;
        }

        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Floating particles */
        .particles {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
        }

        .particle {
            position: absolute;
            width: 10px;
            height: 10px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: float 20s infinite;
        }

        .particle:nth-child(1) { left: 10%; animation-delay: 0s; animation-duration: 25s; }
        .particle:nth-child(2) { left: 20%; animation-delay: 2s; animation-duration: 20s; }
        .particle:nth-child(3) { left: 30%; animation-delay: 4s; animation-duration: 28s; }
        .particle:nth-child(4) { left: 40%; animation-delay: 1s; animation-duration: 22s; }
        .particle:nth-child(5) { left: 50%; animation-delay: 3s; animation-duration: 26s; }
        .particle:nth-child(6) { left: 60%; animation-delay: 5s; animation-duration: 18s; }
        .particle:nth-child(7) { left: 70%; animation-delay: 0.5s; animation-duration: 24s; }
        .particle:nth-child(8) { left: 80%; animation-delay: 2.5s; animation-duration: 21s; }
        .particle:nth-child(9) { left: 90%; animation-delay: 1.5s; animation-duration: 27s; }
        .particle:nth-child(10) { left: 15%; animation-delay: 3.5s; animation-duration: 23s; }

        @keyframes float {
            0%, 100% {
                transform: translateY(100vh) scale(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) scale(1.5);
                opacity: 0;
            }
        }

        .container {
            text-align: center;
            padding: 40px;
            max-width: 700px;
            z-index: 1;
            position: relative;
        }

        .logo {
            margin-bottom: 30px;
            animation: fadeInDown 1s ease;
        }

        .logo h1 {
            font-size: 3.5rem;
            font-weight: 800;
            color: #fff;
            text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            letter-spacing: 3px;
        }

        .logo h1 span {
            color: #ffd700;
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .main-title {
            font-size: 2.8rem;
            font-weight: 700;
            color: #fff;
            margin-bottom: 15px;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
            animation: fadeInUp 1s ease 0.3s both;
        }

        .subtitle {
            font-size: 1.1rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 50px;
            line-height: 1.8;
            animation: fadeInUp 1s ease 0.5s both;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Countdown Timer */
        .countdown {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 50px;
            animation: fadeInUp 1s ease 0.7s both;
            flex-wrap: wrap;
        }

        .countdown-item {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 25px 15px;
            min-width: 100px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .countdown-item:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .countdown-item .number {
            font-size: 3rem;
            font-weight: 700;
            color: #fff;
            display: block;
            line-height: 1;
        }

        .countdown-item .label {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.8);
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 10px;
        }

        /* Newsletter Form */
        .newsletter {
            margin-bottom: 40px;
            animation: fadeInUp 1s ease 0.9s both;
        }

        .newsletter p {
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 20px;
            font-size: 1rem;
        }

        .newsletter-form {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .newsletter-form input[type="email"] {
            padding: 18px 25px;
            border: none;
            border-radius: 50px;
            font-size: 1rem;
            width: 320px;
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            outline: none;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .newsletter-form input[type="email"]:focus {
            transform: scale(1.02);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .newsletter-form input[type="email"]::placeholder {
            color: #999;
        }

        .newsletter-form button {
            padding: 18px 40px;
            border: none;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: 600;
            background: linear-gradient(135deg, #ffd700, #ffb700);
            color: #333;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .newsletter-form button:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(255, 215, 0, 0.4);
        }

        .newsletter-form button:active {
            transform: translateY(-1px);
        }

        /* Success Message */
        .success-message {
            display: none;
            background: rgba(46, 204, 113, 0.2);
            border: 1px solid rgba(46, 204, 113, 0.5);
            color: #fff;
            padding: 15px 25px;
            border-radius: 10px;
            margin-top: 15px;
            animation: fadeInUp 0.5s ease;
        }

        .success-message.show {
            display: block;
        }


        .social-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            animation: fadeInUp 1s ease 1.1s both;
        }

        .social-links a {
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 1.3rem;
            text-decoration: none;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }

        .social-links a:hover {
            background: #fff;
            color: #764ba2;
            transform: translateY(-5px) rotate(360deg);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
        }


        .footer {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.85rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .logo h1 {
                font-size: 2.5rem;
            }

            .main-title {
                font-size: 2rem;
            }

            .subtitle {
                font-size: 1rem;
                padding: 0 10px;
            }

            .countdown {
                gap: 15px;
            }

            .countdown-item {
                min-width: 80px;
                padding: 20px 10px;
            }

            .countdown-item .number {
                font-size: 2.2rem;
            }

            .newsletter-form input[type="email"] {
                width: 100%;
                max-width: 320px;
            }

            .newsletter-form button {
                width: 100%;
                max-width: 320px;
            }
        }

        @media (max-width: 480px) {
            .countdown-item {
                min-width: 70px;
                padding: 15px 8px;
            }

            .countdown-item .number {
                font-size: 1.8rem;
            }

            .countdown-item .label {
                font-size: 0.7rem;
            }
        }

  
        .pulse {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }
    </style>
</head>
<body>
   
    <div class="particles">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
    </div>

    <div class="container">
        <div class="logo pulse">
            <h1>Bd<span>Rising</span></h1>
        </div>

        <h2 class="main-title">We're Coming Soon</h2>
        <p class="subtitle">
            Something amazing is in the works! We're crafting a new experience just for you. 
            Stay tuned and be the first to know when we launch.
        </p>

        <!-- Countdown Timer -->
        <div class="countdown">
            <div class="countdown-item">
                <span class="number" id="days">00</span>
                <span class="label">Days</span>
            </div>
            <div class="countdown-item">
                <span class="number" id="hours">00</span>
                <span class="label">Hours</span>
            </div>
            <div class="countdown-item">
                <span class="number" id="minutes">00</span>
                <span class="label">Minutes</span>
            </div>
            <div class="countdown-item">
                <span class="number" id="seconds">00</span>
                <span class="label">Seconds</span>
            </div>
        </div>

        <!-- Newsletter Signup -->
        <div class="newsletter">
            <p>Get notified when we launch. No spam, we promise!</p>
            <form class="newsletter-form" id="subscribeForm">
                <input type="email" name="email" placeholder="Enter your email address" required>
                <button type="submit">
                    <i class="fas fa-paper-plane"></i> Notify Me
                </button>
            </form>
            <div class="success-message" id="successMessage">
                <i class="fas fa-check-circle"></i> Thank you! We'll notify you when we launch.
            </div>
        </div>

  
        <div class="social-links">
            <a href="#" title="Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" title="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" title="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            <a href="#" title="YouTube"><i class="fab fa-youtube"></i></a>
        </div>
    </div>

    <div class="footer">
        <p>&copy; <?php echo date('Y'); ?> BdRising. All rights reserved.</p>
    </div>

    <script>
        // Set the launch date (30 days from now)
        const launchDate = new Date();
        launchDate.setDate(launchDate.getDate() + 30);

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = launchDate - now;

            if (distance < 0) {
                document.getElementById('days').innerText = '00';
                document.getElementById('hours').innerText = '00';
                document.getElementById('minutes').innerText = '00';
                document.getElementById('seconds').innerText = '00';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').innerText = days.toString().padStart(2, '0');
            document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
            document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
        }

        // Update countdown every second
        updateCountdown();
        setInterval(updateCountdown, 1000);

        // Newsletter form submission
        document.getElementById('subscribeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Show success message
            document.getElementById('successMessage').classList.add('show');
            
            // Reset form
            this.reset();
            
            // Hide success message after 5 seconds
            setTimeout(() => {
                document.getElementById('successMessage').classList.remove('show');
            }, 5000);
        });

   
        document.querySelectorAll('.countdown-item').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255, 255, 255, 0.25)';
            });
            item.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255, 255, 255, 0.15)';
            });
        });
    </script>
</body>
</html>

