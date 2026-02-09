// AI Chat endpoint
const { chatWithAI } = require('./ai-chat');

app.post('/api/chat', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message required' });
        }

        // Chat with AI
        const aiResponse = await chatWithAI(
            message,
            req.session.userId,
            db,
            history || []
        );

        res.json(aiResponse);
    } catch (error) {
        console.error('❌ AI Chat Error:', error);
        res.status(500).json({
            error: 'AI service error',
            answer: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
        });
    }
});
