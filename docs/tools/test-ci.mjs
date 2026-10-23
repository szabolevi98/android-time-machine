// Preserve the complete TAP output and expose failed test diagnostics as
// GitHub annotations, so a failed check can be understood without log access.
import fs from 'node:fs';
import {spawn} from 'node:child_process';
const files=fs.readdirSync('tests').filter(f=>f.endsWith('.cjs')).map(f=>'tests/'+f);
const child=spawn(process.execPath,['--test','--test-reporter=tap',...files],{stdio:['ignore','pipe','pipe']});
let output='';
for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{output+=data;process.stdout.write(data);});
child.on('error',error=>{console.error(error);process.exitCode=1;});
child.on('close',code=>{
 if(code&&process.env.GITHUB_ACTIONS){
  const lines=output.split('\n'),blocks=[];
  // A failing file's stderr can precede its TAP Subtest header.
  for(let i=0;i<lines.length;i++)if(/^not ok /.test(lines[i]))blocks.push(lines.slice(Math.max(0,i-120),i+18).join('\n'));
  const escape=s=>s.replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A');
  for(const block of blocks)console.log('::error::'+escape(block.slice(-12000)));
 }
 process.exitCode=code??1;
});
