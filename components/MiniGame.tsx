import React, { useState, useMemo } from 'react';
import { Lightbulb } from 'lucide-react';

interface MiniGameProps {
    onSkip: () => void;
    progress: number;
    loadingMessage: string;
}

const triviaQuestions = [
    { question: 'What is the capital of France?', answers: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctAnswer: 'Paris' },
    { question: 'Which planet is known as the Red Planet?', answers: ['Earth', 'Mars', 'Jupiter', 'Venus'], correctAnswer: 'Mars' },
    { question: 'What is the largest ocean on Earth?', answers: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctAnswer: 'Pacific' },
    { question: 'Who wrote "To Kill a Mockingbird"?', answers: ['Harper Lee', 'J.K. Rowling', 'Ernest Hemingway', 'Mark Twain'], correctAnswer: 'Harper Lee' },
    { question: 'What is the chemical symbol for gold?', answers: ['Ag', 'Au', 'Pb', 'Fe'], correctAnswer: 'Au' },
    { question: 'In what year did the Titanic sink?', answers: ['1905', '1912', '1918', '1923'], correctAnswer: '1912' },
    { question: 'What is the hardest natural substance on Earth?', answers: ['Gold', 'Iron', 'Diamond', 'Quartz'], correctAnswer: 'Diamond' },
    { question: 'What is the main ingredient in guacamole?', answers: ['Tomato', 'Avocado', 'Onion', 'Lime'], correctAnswer: 'Avocado' },
    { question: 'How many continents are there?', answers: ['5', '6', '7', '8'], correctAnswer: '7' },
    { question: 'Who painted the Mona Lisa?', answers: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'], correctAnswer: 'Leonardo da Vinci' },
    { question: 'What is the smallest country in the world?', answers: ['Monaco', 'Vatican City', 'Nauru', 'San Marino'], correctAnswer: 'Vatican City' },
    { question: 'Which artist is known for the "Campbell\'s Soup Cans" series?', answers: ['Andy Warhol', 'Roy Lichtenstein', 'Jackson Pollock', 'Salvador Dalí'], correctAnswer: 'Andy Warhol' },
    { question: 'What is the longest river in the world?', answers: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'], correctAnswer: 'Nile River' },
    { question: 'Which element has the atomic number 1?', answers: ['Helium', 'Oxygen', 'Hydrogen', 'Carbon'], correctAnswer: 'Hydrogen' },
    { question: 'What is the currency of Japan?', answers: ['Won', 'Yuan', 'Yen', 'Rupee'], correctAnswer: 'Yen' },
    { question: 'Who discovered penicillin?', answers: ['Marie Curie', 'Alexander Fleming', 'Louis Pasteur', 'Isaac Newton'], correctAnswer: 'Alexander Fleming' },
    { question: 'What is the largest desert in the world?', answers: ['Sahara Desert', 'Gobi Desert', 'Arabian Desert', 'Antarctic Polar Desert'], correctAnswer: 'Antarctic Polar Desert' },
    { question: 'In which country is the ancient city of Petra?', answers: ['Egypt', 'Greece', 'Jordan', 'Turkey'], correctAnswer: 'Jordan' },
    { question: 'What is the main language spoken in Brazil?', answers: ['Spanish', 'Portuguese', 'Brazilian', 'English'], correctAnswer: 'Portuguese' },
    { question: 'What is the tallest mammal?', answers: ['Elephant', 'Giraffe', 'Hippo', 'Rhino'], correctAnswer: 'Giraffe' },
    { question: 'Who developed the theory of relativity?', answers: ['Isaac Newton', 'Galileo Galilei', 'Nikola Tesla', 'Albert Einstein'], correctAnswer: 'Albert Einstein' },
    { question: 'What is the name of the galaxy our solar system is in?', answers: ['Andromeda', 'Triangulum', 'Milky Way', 'Whirlpool'], correctAnswer: 'Milky Way' },
    { question: 'What is the capital of Canada?', answers: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'], correctAnswer: 'Ottawa' },
    { question: 'Which bone is the longest in the human body?', answers: ['Femur', 'Humerus', 'Tibia', 'Fibula'], correctAnswer: 'Femur' },
    { question: 'What is the most consumed beverage in the world after water?', answers: ['Coffee', 'Tea', 'Beer', 'Orange Juice'], correctAnswer: 'Tea' },
    { question: 'Which country is known as the Land of the Rising Sun?', answers: ['China', 'South Korea', 'Japan', 'Thailand'], correctAnswer: 'Japan' },
    { question: 'What is the main component of Earth\'s atmosphere?', answers: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Argon'], correctAnswer: 'Nitrogen' },
    { question: 'Who wrote the play "Romeo and Juliet"?', answers: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'George Orwell'], correctAnswer: 'William Shakespeare' },
    { question: 'Which ocean is the smallest?', answers: ['Indian', 'Southern', 'Arctic', 'Atlantic'], correctAnswer: 'Arctic' },
    { question: 'What is the study of earthquakes called?', answers: ['Meteorology', 'Seismology', 'Geology', 'Volcanology'], correctAnswer: 'Seismology' },
    { question: 'Which planet is closest to the sun?', answers: ['Venus', 'Mars', 'Mercury', 'Earth'], correctAnswer: 'Mercury' },
    { question: 'What is the capital of Australia?', answers: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correctAnswer: 'Canberra' },
    { question: 'How many hearts does an octopus have?', answers: ['One', 'Two', 'Three', 'Four'], correctAnswer: 'Three' },
    { question: 'Which country gifted the Statue of Liberty to the USA?', answers: ['United Kingdom', 'France', 'Spain', 'Italy'], correctAnswer: 'France' },
    { question: 'What is the name of the largest moon of Saturn?', answers: ['Europa', 'Ganymede', 'Titan', 'Callisto'], correctAnswer: 'Titan' },
    { question: 'What is the chemical formula for water?', answers: ['CO2', 'O2', 'H2O', 'NaCl'], correctAnswer: 'H2O' },
    { question: 'Who was the first person to step on the moon?', answers: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Michael Collins'], correctAnswer: 'Neil Armstrong' },
    { question: 'What is the fear of spiders called?', answers: ['Acrophobia', 'Claustrophobia', 'Arachnophobia', 'Agoraphobia'], correctAnswer: 'Arachnophobia' },
    { question: 'Which is the only mammal capable of sustained flight?', answers: ['Flying Squirrel', 'Bat', 'Ostrich', 'Penguin'], correctAnswer: 'Bat' },
    { question: 'What is the capital of Spain?', answers: ['Barcelona', 'Lisbon', 'Madrid', 'Seville'], correctAnswer: 'Madrid' },
    { question: 'In Greek mythology, who is the god of the sea?', answers: ['Zeus', 'Hades', 'Poseidon', 'Apollo'], correctAnswer: 'Poseidon' },
    { question: 'Which country is famous for its tulips and windmills?', answers: ['Belgium', 'Germany', 'Netherlands', 'Denmark'], correctAnswer: 'Netherlands' },
    { question: 'What is the world\'s most spoken language by number of native speakers?', answers: ['English', 'Mandarin Chinese', 'Spanish', 'Hindi'], correctAnswer: 'Mandarin Chinese' },
    { question: 'What is the boiling point of water at sea level in Celsius?', answers: ['90°C', '100°C', '110°C', '120°C'], correctAnswer: '100°C' },
    { question: 'Which film was the first to be released in full color?', answers: ['The Wizard of Oz', 'Gone with the Wind', 'Becky Sharp', 'Snow White'], correctAnswer: 'Becky Sharp' },
    { question: 'What is the name of the world\'s highest waterfall?', answers: ['Niagara Falls', 'Angel Falls', 'Victoria Falls', 'Iguazu Falls'], correctAnswer: 'Angel Falls' },
    { question: 'How many players are on a standard soccer team on the field?', answers: ['9', '10', '11', '12'], correctAnswer: '11' },
    { question: 'What is the largest country by land area?', answers: ['Canada', 'China', 'USA', 'Russia'], correctAnswer: 'Russia' },
    { question: 'Which instrument has 88 keys?', answers: ['Guitar', 'Violin', 'Piano', 'Trumpet'], correctAnswer: 'Piano' },
    { question: 'What is the name of the dog in the "Peanuts" comic strip?', answers: ['Pluto', 'Goofy', 'Snoopy', 'Odie'], correctAnswer: 'Snoopy' },
    { question: 'Which is the largest island in the world?', answers: ['Greenland', 'New Guinea', 'Borneo', 'Madagascar'], correctAnswer: 'Greenland' },
    { question: 'What is a group of lions called?', answers: ['Herd', 'Pack', 'Pride', 'Flock'], correctAnswer: 'Pride' },
    { question: 'Who is the author of the "Harry Potter" series?', answers: ['J.R.R. Tolkien', 'George R.R. Martin', 'J.K. Rowling', 'C.S. Lewis'], correctAnswer: 'J.K. Rowling' },
    { question: 'What is the primary ingredient in hummus?', answers: ['Lentils', 'Chickpeas', 'Black Beans', 'Soybeans'], correctAnswer: 'Chickpeas' },
    { question: 'Which city is known as "The Big Apple"?', answers: ['Los Angeles', 'Chicago', 'New York City', 'Boston'], correctAnswer: 'New York City' },
    { question: 'What is the process by which plants make their own food?', answers: ['Respiration', 'Transpiration', 'Photosynthesis', 'Pollination'], correctAnswer: 'Photosynthesis' },
    { question: 'What is the smallest prime number?', answers: ['0', '1', '2', '3'], correctAnswer: '2' },
    { question: 'What is the capital of Italy?', answers: ['Milan', 'Venice', 'Rome', 'Naples'], correctAnswer: 'Rome' },
    { question: 'Who painted "The Starry Night"?', answers: ['Claude Monet', 'Vincent van Gogh', 'Pablo Picasso', 'Salvador Dalí'], correctAnswer: 'Vincent van Gogh' },
    { question: 'Which country has the most pyramids?', answers: ['Egypt', 'Mexico', 'Peru', 'Sudan'], correctAnswer: 'Sudan' },
    { question: 'What is the fastest land animal?', answers: ['Lion', 'Pronghorn', 'Cheetah', 'Wildebeest'], correctAnswer: 'Cheetah' },
    { question: 'In which year did World War II end?', answers: ['1943', '1944', '1945', '1946'], correctAnswer: '1945' },
    { question: 'What is the currency of the United Kingdom?', answers: ['Euro', 'Dollar', 'Pound Sterling', 'Franc'], correctAnswer: 'Pound Sterling' },
    { question: 'Which is the largest organ in the human body?', answers: ['Liver', 'Brain', 'Skin', 'Heart'], correctAnswer: 'Skin' },
    { question: 'Who invented the light bulb?', answers: ['Nikola Tesla', 'Thomas Edison', 'Alexander Graham Bell', 'Benjamin Franklin'], correctAnswer: 'Thomas Edison' },
    { question: 'What is the capital of Egypt?', answers: ['Alexandria', 'Giza', 'Cairo', 'Luxor'], correctAnswer: 'Cairo' },
    { question: 'What is the most abundant gas in Earth\'s atmosphere?', answers: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'], correctAnswer: 'Nitrogen' },
    { question: 'Which famous scientist developed the laws of motion?', answers: ['Galileo Galilei', 'Albert Einstein', 'Isaac Newton', 'Stephen Hawking'], correctAnswer: 'Isaac Newton' },
    { question: 'Mount Everest is located in which mountain range?', answers: ['The Andes', 'The Rockies', 'The Himalayas', 'The Alps'], correctAnswer: 'The Himalayas' },
    { question: 'What is the main component of glass?', answers: ['Quartz', 'Sand', 'Limestone', 'Clay'], correctAnswer: 'Sand' },
    { question: 'What is the capital of Russia?', answers: ['Saint Petersburg', 'Moscow', 'Kazan', 'Novosibirsk'], correctAnswer: 'Moscow' },
    { question: 'Which bird is a symbol of peace?', answers: ['Eagle', 'Dove', 'Swan', 'Owl'], correctAnswer: 'Dove' },
    { question: 'What is the name of the galaxy closest to the Milky Way?', answers: ['Triangulum', 'Andromeda', 'Pinwheel', 'Sombrero'], correctAnswer: 'Andromeda' },
    { question: 'How many colors are in a rainbow?', answers: ['6', '7', '8', '9'], correctAnswer: '7' },
    { question: 'What is the main character in "The Great Gatsby"?', answers: ['Nick Carraway', 'Tom Buchanan', 'Jay Gatsby', 'Daisy Buchanan'], correctAnswer: 'Jay Gatsby' },
    { question: 'What is the capital of Germany?', answers: ['Munich', 'Hamburg', 'Berlin', 'Frankfurt'], correctAnswer: 'Berlin' },
    { question: 'Which planet has the most moons?', answers: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correctAnswer: 'Saturn' },
    { question: 'In which sport would you perform a slam dunk?', answers: ['Volleyball', 'Basketball', 'Tennis', 'Badminton'], correctAnswer: 'Basketball' },
    { question: 'What is the largest species of shark?', answers: ['Great White Shark', 'Hammerhead Shark', 'Whale Shark', 'Tiger Shark'], correctAnswer: 'Whale Shark' },
    { question: 'What is the name of the river that flows through London?', answers: ['Seine', 'Danube', 'Thames', 'Tiber'], correctAnswer: 'Thames' },
    { question: 'What is the capital of South Korea?', answers: ['Busan', 'Incheon', 'Seoul', 'Daegu'], correctAnswer: 'Seoul' },
    { question: 'Who was the first female Prime Minister of the United Kingdom?', answers: ['Theresa May', 'Margaret Thatcher', 'Angela Merkel', 'Indira Gandhi'], correctAnswer: 'Margaret Thatcher' },
    { question: 'What is the hardest known mineral?', answers: ['Topaz', 'Quartz', 'Diamond', 'Corundum'], correctAnswer: 'Diamond' },
    { question: 'What does "CPU" stand for?', answers: ['Central Processing Unit', 'Computer Personal Unit', 'Central Power Unit', 'Core Processing Unit'], correctAnswer: 'Central Processing Unit' },
    { question: 'What is the square root of 144?', answers: ['10', '11', '12', '13'], correctAnswer: '12' },
    { question: 'Which country is the largest producer of coffee?', answers: ['Colombia', 'Vietnam', 'Brazil', 'Ethiopia'], correctAnswer: 'Brazil' },
    { question: 'What type of animal is a Komodo dragon?', answers: ['Snake', 'Crocodile', 'Lizard', 'Dinosaur'], correctAnswer: 'Lizard' },
    { question: 'What is the capital of India?', answers: ['Mumbai', 'Kolkata', 'New Delhi', 'Bangalore'], correctAnswer: 'New Delhi' },
    { question: 'Which element is represented by the symbol "Fe"?', answers: ['Fluorine', 'Iron', 'Gold', 'Silver'], correctAnswer: 'Iron' },
    { question: 'What is the world\'s largest coral reef system?', answers: ['Red Sea Coral Reef', 'Belize Barrier Reef', 'Great Barrier Reef', 'Maldives Coral Reefs'], correctAnswer: 'Great Barrier Reef' },
    { question: 'Who is known as the "Father of Computers"?', answers: ['Alan Turing', 'Charles Babbage', 'Bill Gates', 'Steve Jobs'], correctAnswer: 'Charles Babbage' },
    { question: 'What is the name of the first book in the Bible?', answers: ['Exodus', 'Genesis', 'Leviticus', 'Numbers'], correctAnswer: 'Genesis' },
    { question: 'What is the study of birds called?', answers: ['Herpetology', 'Ornithology', 'Entomology', 'Ichthyology'], correctAnswer: 'Ornithology' },
    { question: 'Which ocean is bordered by Africa, Asia, Australia, and the Southern Ocean?', answers: ['Atlantic Ocean', 'Pacific Ocean', 'Indian Ocean', 'Arctic Ocean'], correctAnswer: 'Indian Ocean' },
    { question: 'What is the chemical symbol for sodium?', answers: ['S', 'So', 'Na', 'Sd'], correctAnswer: 'Na' },
    { question: 'Which is the largest state in the USA by area?', answers: ['Texas', 'California', 'Alaska', 'Montana'], correctAnswer: 'Alaska' },
    { question: 'What is the name of the currency used in Switzerland?', answers: ['Euro', 'Swiss Franc', 'Krone', 'Złoty'], correctAnswer: 'Swiss Franc' },
    { question: 'Who wrote "1984"?', answers: ['Aldous Huxley', 'Ray Bradbury', 'George Orwell', 'Philip K. Dick'], correctAnswer: 'George Orwell' }
];

const MiniGame: React.FC<MiniGameProps> = ({ onSkip, progress, loadingMessage }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [triviaCompleted, setTriviaCompleted] = useState(false);

    const shuffledQuestions = useMemo(() => [...triviaQuestions].sort(() => Math.random() - 0.5), []);
    const currentQuestion = shuffledQuestions[currentQuestionIndex];

    const handleAnswerClick = (answer: string) => {
        if (showFeedback) return;
        setSelectedAnswer(answer);
        setShowFeedback(true);
        if (answer === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }
        setTimeout(() => {
            setShowFeedback(false);
            setSelectedAnswer(null);
            if (currentQuestionIndex < shuffledQuestions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                setTriviaCompleted(true);
            }
        }, 1500);
    };
    
    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md relative">
                <div className="text-center">
                    <Lightbulb className="mx-auto h-8 w-8 text-yellow-400 mb-2"/>
                    <h2 className="text-lg font-bold">Trivia Challenge</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">A little fun while you wait.</p>
                </div>
                
                <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                    {triviaCompleted ? (
                        <div className="text-center font-semibold min-h-[120px] flex items-center justify-center">
                            <p>All trivia completed! Generating your study materials...</p>
                        </div>
                    ) : (
                        <>
                            <p className="font-semibold text-center mb-4 min-h-[48px]">{currentQuestion.question}</p>
                            <div className="grid grid-cols-2 gap-3">
                                {currentQuestion.answers.map(answer => {
                                    const isCorrect = answer === currentQuestion.correctAnswer;
                                    const isSelected = answer === selectedAnswer;
                                    let buttonClass = 'bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600';
                                    if (showFeedback) {
                                        if (isCorrect) buttonClass = 'bg-green-500 text-white';
                                        else if (isSelected) buttonClass = 'bg-red-500 text-white';
                                        else buttonClass = 'bg-slate-200 dark:bg-slate-600 opacity-60';
                                    }
                                    return (
                                        <button
                                            key={answer}
                                            onClick={() => handleAnswerClick(answer)}
                                            disabled={showFeedback}
                                            className={`p-3 text-sm font-medium rounded-md transition-all duration-300 disabled:cursor-not-allowed ${buttonClass}`}
                                        >
                                            {answer}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-between items-center mt-4 px-2">
                    <p className="text-sm font-semibold">Score: <span className="text-blue-600 dark:text-blue-400">{score}</span></p>
                    <button onClick={onSkip} className="text-sm font-medium text-slate-500 hover:underline">Skip Game</button>
                </div>
            </div>

             <div className="w-full max-w-md mt-8">
                <div className="w-full flex items-center mb-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 min-w-[40px] text-right">{Math.round(progress)}%</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">{loadingMessage}</p>
            </div>
        </div>
    );
};

export default MiniGame;