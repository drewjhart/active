import OpenAI from 'openai';
import { toFile } from 'openai';

const openai = new OpenAI({auth: process.env.OPENAI_API_KEY});

export async function analyseConversation(
  bufferArray,
) {
  try {
    let messages = [
      {
        role: 'system',
        content:
          'You are a formally trained mediator, highly skilled in detecting and resolving conversational disputes in a business context. You will receive an array of strings representing a conversation. You will analyze this array and identify moments in the conversation where individuals are not communicating collaboratively. You will return a JSON object, containing an array of all identified areas, in the following form: {[{voiceOneStrings: string, voiceTwoStrings: string, reason: string}]}',
      },
    ];
    messages.push({
      role: 'user',
      content: `The conversation between two individuals is here in a stringified JSON: ${JSON.stringify(bufferArray)}. 
      Source: voiceone represents one person and source: voicetwo represents the other person. 
      Analyze the strings and identify areas where the two people are speaking passed each other, are not on the same page, or are in dispute.
      Only flag severe areas of dispute/communication breakdown, do not flag issues with slight miscommunication or minor disagreements. 

      Few shot examples:
      Example 1:
      voiceone: 'Hey Harriet, do you have a moment to discuss the new project timeline?"
      voicetwo: "Sure, Maisie. I was thinking about that too." 
      reason: This is not a dispute, they are in agreement. Do not flag.

      Example 2:
      voiceone: "I was thinking we could push the deadline up by in two weeks to impress the client."
      voicetwo: "That sounds good, but the code base is really messy. We need to refactor it first."
      voiceone: "Exactly. That's why we need to move work faster. Extra hours should help us meet the new deadline."
      reason: This is an example of two individuals talking passed each other. one wants a schedule change, the other wants to refactor first. They are not on the same page. Flag this as an issue.

      Make sure to use the provided strings above, do not just generate your own data.
        Return an array of each identified area in the following format, as a JSON object:

        {
          issues:[
            {
              voiceOneString: the relevant strings from the first person (from the inputted array),
              voiceTwoString: the relevant strings from the second person (from the inputted array),
              reason: a short description of the nature of the dispute
            }
          ]
        }

        After providing the analysis, pause. Ensure that you are only returning a valid JSON object in the above format.
        Do not include any additional information or text in the response.
        Do not include markup lanugage or formatting in the response. Ensure that json.parse will work on the provided object before returning it.
        Follow this output exactly. Do not use any other format.
      `,
    });

    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
    });
    // Return the response
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error during analysis: ', error);
  }
}
