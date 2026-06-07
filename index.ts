import 'dotenv/config';
import { streamText } from 'ai';

async function main() {
  console.log('Starting AI Gateway text generation...\n');

  const { textStream, usage } = streamText({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: 'Write a short poem about the future of AI.',
      },
    ],
  });

  console.log('Streaming response:\n');

  for await (const chunk of textStream) {
    process.stdout.write(chunk);
  }

  console.log('\n');

  const finalUsage = await usage;
  console.log('\nToken Usage:');
  console.log(`- Prompt tokens: ${finalUsage.promptTokens}`);
  console.log(`- Completion tokens: ${finalUsage.completionTokens}`);
  console.log(`- Total tokens: ${finalUsage.totalTokens}`);
}

main().catch(console.error);
